import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  meetingId?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3002',
    credentials: true,
  },
  namespace: '/meetings',
})
export class MeetingsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private activeMeetings: Map<string, Set<string>> = new Map(); // meetingId -> Set of socketIds

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract token from handshake
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
      
      if (!token) {
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = await this.jwtService.verifyAsync(token);
      client.userId = payload.sub;

      console.log(`Client connected: ${client.id}, userId: ${client.userId}`);
    } catch (error) {
      console.error('Connection auth error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    console.log(`Client disconnected: ${client.id}`);
    
    // Remove from active meetings
    if (client.meetingId) {
      const participants = this.activeMeetings.get(client.meetingId);
      if (participants) {
        participants.delete(client.id);
        if (participants.size === 0) {
          this.activeMeetings.delete(client.meetingId);
        }
      }

      // Notify others in the meeting
      client.to(client.meetingId).emit('participant-left', {
        userId: client.userId,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @SubscribeMessage('join-meeting')
  async handleJoinMeeting(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { meetingId: string; isMuted?: boolean; isCameraOff?: boolean },
  ) {
    try {
      const { meetingId, isMuted = true, isCameraOff = true } = data;

      // Verify user has access to meeting
      const meeting = await this.prisma.meeting.findUnique({
        where: { id: meetingId },
        include: {
          host: true,
          participants: {
            where: { userId: client.userId },
          },
        },
      });

      if (!meeting) {
        client.emit('error', { message: 'Meeting not found' });
        return;
      }

      const isHost = meeting.hostId === client.userId;
      const isParticipant = meeting.participants.length > 0;

      if (!isHost && !isParticipant) {
        client.emit('error', { message: 'You do not have access to this meeting' });
        return;
      }

      // Join the meeting room
      client.join(meetingId);
      client.meetingId = meetingId;

      // Track active participants
      if (!this.activeMeetings.has(meetingId)) {
        this.activeMeetings.set(meetingId, new Set());
      }
      this.activeMeetings.get(meetingId).add(client.id);

      // Update participant status in database
      const participant = await this.prisma.meetingParticipant.upsert({
        where: {
          meetingId_userId: {
            meetingId,
            userId: client.userId,
          },
        },
        update: {
          isMuted,
          isCameraOff,
          joinedAt: new Date(),
        },
        create: {
          meetingId,
          userId: client.userId,
          status: 'accepted',
          isMuted,
          isCameraOff,
          joinedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true,
            },
          },
        },
      });

      // Notify others in the meeting
      client.to(meetingId).emit('participant-joined', {
        user: participant.user,
        isMuted: participant.isMuted,
        isCameraOff: participant.isCameraOff,
        isHandRaised: participant.isHandRaised,
        timestamp: new Date().toISOString(),
      });

      // Send current participants to the new joiner
      const allParticipants = await this.prisma.meetingParticipant.findMany({
        where: { meetingId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true,
            },
          },
        },
      });

      client.emit('meeting-state', {
        participants: allParticipants.map((p) => ({
          user: p.user,
          isHandRaised: p.isHandRaised,
          isMuted: p.isMuted,
          isCameraOff: p.isCameraOff,
        })),
        activeParticipantCount: this.activeMeetings.get(meetingId)?.size || 0,
      });

      console.log(`User ${client.userId} joined meeting ${meetingId}`);
    } catch (error) {
      console.error('Join meeting error:', error);
      client.emit('error', { message: 'Failed to join meeting' });
    }
  }

  @SubscribeMessage('leave-meeting')
  async handleLeaveMeeting(@ConnectedSocket() client: AuthenticatedSocket) {
    if (!client.meetingId) return;

    const meetingId = client.meetingId;

    // Update participant status
    await this.prisma.meetingParticipant.updateMany({
      where: {
        meetingId,
        userId: client.userId,
      },
      data: {
        leftAt: new Date(),
      },
    });

    // Remove from active meetings
    const participants = this.activeMeetings.get(meetingId);
    if (participants) {
      participants.delete(client.id);
    }

    // Notify others
    client.to(meetingId).emit('participant-left', {
      userId: client.userId,
      timestamp: new Date().toISOString(),
    });

    client.leave(meetingId);
    client.meetingId = undefined;

    console.log(`User ${client.userId} left meeting ${meetingId}`);
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { message: string },
  ) {
    if (!client.meetingId) {
      client.emit('error', { message: 'Not in a meeting' });
      return;
    }

    try {
      // Save message to database
      const messageRecord = await this.prisma.meetingMessage.create({
        data: {
          meetingId: client.meetingId,
          userId: client.userId,
          message: data.message,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true,
            },
          },
        },
      });

      // Broadcast to all participants in the meeting
      this.server.to(client.meetingId).emit('message-received', {
        id: messageRecord.id,
        userId: messageRecord.userId,
        userName: `${messageRecord.user.firstName} ${messageRecord.user.lastName}`,
        message: messageRecord.message,
        timestamp: messageRecord.createdAt.toISOString(),
      });

      console.log(`Message sent in meeting ${client.meetingId} by user ${client.userId}`);
    } catch (error) {
      console.error('Send message error:', error);
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage('send-reaction')
  async handleSendReaction(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { emoji: string },
  ) {
    if (!client.meetingId) {
      client.emit('error', { message: 'Not in a meeting' });
      return;
    }

    try {
      // Optionally save reaction to database for analytics
      await this.prisma.meetingReaction.create({
        data: {
          meetingId: client.meetingId,
          userId: client.userId,
          emoji: data.emoji,
        },
      });

      const user = await this.prisma.user.findUnique({
        where: { id: client.userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      });

      // Broadcast reaction to all participants
      this.server.to(client.meetingId).emit('reaction-received', {
        id: Date.now().toString(),
        emoji: data.emoji,
        userId: client.userId,
        userName: `${user.firstName} ${user.lastName}`,
        timestamp: Date.now(),
      });

      console.log(`Reaction ${data.emoji} sent in meeting ${client.meetingId} by user ${client.userId}`);
    } catch (error) {
      console.error('Send reaction error:', error);
      client.emit('error', { message: 'Failed to send reaction' });
    }
  }

  @SubscribeMessage('update-status')
  async handleUpdateStatus(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { isHandRaised?: boolean; isMuted?: boolean; isCameraOff?: boolean },
  ) {
    if (!client.meetingId) {
      client.emit('error', { message: 'Not in a meeting' });
      return;
    }

    try {
      // Update participant status in database
      const participant = await this.prisma.meetingParticipant.updateMany({
        where: {
          meetingId: client.meetingId,
          userId: client.userId,
        },
        data: {
          ...(data.isHandRaised !== undefined && { isHandRaised: data.isHandRaised }),
          ...(data.isMuted !== undefined && { isMuted: data.isMuted }),
          ...(data.isCameraOff !== undefined && { isCameraOff: data.isCameraOff }),
        },
      });

      // Broadcast status update to all participants
      this.server.to(client.meetingId).emit('status-updated', {
        userId: client.userId,
        ...data,
        timestamp: new Date().toISOString(),
      });

      console.log(`Status updated in meeting ${client.meetingId} by user ${client.userId}`, data);
    } catch (error) {
      console.error('Update status error:', error);
      client.emit('error', { message: 'Failed to update status' });
    }
  }

  @SubscribeMessage('screen-share-started')
  async handleScreenShareStarted(@ConnectedSocket() client: AuthenticatedSocket) {
    if (!client.meetingId) return;

    const user = await this.prisma.user.findUnique({
      where: { id: client.userId },
      select: { firstName: true, lastName: true },
    });

    // Notify all participants
    client.to(client.meetingId).emit('screen-share-started', {
      userId: client.userId,
      userName: `${user.firstName} ${user.lastName}`,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('screen-share-stopped')
  async handleScreenShareStopped(@ConnectedSocket() client: AuthenticatedSocket) {
    if (!client.meetingId) return;

    // Notify all participants
    client.to(client.meetingId).emit('screen-share-stopped', {
      userId: client.userId,
      timestamp: new Date().toISOString(),
    });
  }
}
