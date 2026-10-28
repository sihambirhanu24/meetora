import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { AddParticipantsDto } from './dto/add-participants.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  // Create a new conversation
  async createConversation(
    userId: string,
    createConversationDto: CreateConversationDto,
  ) {
    const { participantIds, workspaceId, type, ...conversationData } =
      createConversationDto;

    // Validate workspace access if provided
    if (workspaceId) {
      await this.validateWorkspaceMembership(workspaceId, userId);

      // For workspace channels, validate participants are workspace members
      if (type === 'channel') {
        for (const participantId of participantIds) {
          await this.validateWorkspaceMembership(workspaceId, participantId);
        }
      }
    }

    // Validate direct conversations have exactly 2 participants (creator + 1 other)
    if (type === 'direct' && participantIds.length !== 1) {
      throw new BadRequestException(
        'Direct conversations must have exactly one other participant',
      );
    }

    // Check if direct conversation already exists
    if (type === 'direct') {
      const existingConversation = await this.findExistingDirectConversation(
        userId,
        participantIds[0],
      );
      if (existingConversation) {
        return existingConversation;
      }
    }

    // Create conversation with participants
    const conversation = await this.prisma.conversation.create({
      data: {
        type,
        workspaceId,
        name: conversationData.name,
        description: conversationData.description,
        isPrivate: conversationData.isPrivate ?? false,
        createdById: userId,
        participants: {
          create: [
            // Add creator
            {
              userId,
              role: type === 'channel' ? 'admin' : 'member',
            },
            // Add other participants
            ...participantIds.map((participantId) => ({
              userId: participantId,
              role: 'member',
            })),
          ],
        },
      },
      include: {
        createdBy: this.getUserSelect(),
        participants: {
          include: {
            user: this.getUserSelect(),
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: this.getUserSelect(),
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

    return this.formatConversation(conversation, userId);
  }

  // Get all conversations for a user
  async findAllConversations(userId: string, workspaceId?: string) {
    const where: any = {
      participants: {
        some: {
          userId,
          leftAt: null,
        },
      },
    };

    if (workspaceId) {
      // Validate workspace access
      await this.validateWorkspaceMembership(workspaceId, userId);
      where.workspaceId = workspaceId;
    }

    const conversations = await this.prisma.conversation.findMany({
      where,
      include: {
        createdBy: this.getUserSelect(),
        participants: {
          where: { leftAt: null },
          include: {
            user: this.getUserSelect(),
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          where: { isDeleted: false },
          include: {
            sender: this.getUserSelect(),
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    });

    return conversations.map((conv) => this.formatConversation(conv, userId));
  }

  // Get a single conversation
  async findOneConversation(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        createdBy: this.getUserSelect(),
        participants: {
          where: { leftAt: null },
          include: {
            user: this.getUserSelect(),
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          where: { isDeleted: false },
          include: {
            sender: this.getUserSelect(),
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Check if user is a participant
    await this.validateConversationAccess(conversationId, userId);

    return this.formatConversation(conversation, userId);
  }

  // Update conversation (name, description, etc.)
  async updateConversation(
    conversationId: string,
    userId: string,
    updateConversationDto: UpdateConversationDto,
  ) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          where: { userId, leftAt: null },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const participant = conversation.participants[0];
    if (!participant) {
      throw new ForbiddenException('You are not a member of this conversation');
    }

    // Only admins can update channels
    if (conversation.type === 'channel' && participant.role !== 'admin') {
      throw new ForbiddenException(
        'Only channel admins can update this conversation',
      );
    }

    // Cannot update direct conversations
    if (conversation.type === 'direct') {
      throw new BadRequestException('Cannot update direct conversations');
    }

    const updated = await this.prisma.conversation.update({
      where: { id: conversationId },
      data: updateConversationDto,
      include: {
        createdBy: this.getUserSelect(),
        participants: {
          where: { leftAt: null },
          include: {
            user: this.getUserSelect(),
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

    return this.formatConversation(updated, userId);
  }

  // Add participants to a conversation
  async addParticipants(
    conversationId: string,
    userId: string,
    addParticipantsDto: AddParticipantsDto,
  ) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          where: { userId, leftAt: null },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const participant = conversation.participants[0];
    if (!participant) {
      throw new ForbiddenException('You are not a member of this conversation');
    }

    // Only admins can add participants to channels
    if (conversation.type === 'channel' && participant.role !== 'admin') {
      throw new ForbiddenException(
        'Only channel admins can add participants',
      );
    }

    // Cannot add participants to direct conversations
    if (conversation.type === 'direct') {
      throw new BadRequestException('Cannot add participants to direct conversations');
    }

    // Validate workspace membership if conversation is in a workspace
    if (conversation.workspaceId) {
      for (const newParticipantId of addParticipantsDto.userIds) {
        await this.validateWorkspaceMembership(
          conversation.workspaceId,
          newParticipantId,
        );
      }
    }

    // Add participants
    const newParticipants = await this.prisma.conversationParticipant.createMany({
      data: addParticipantsDto.userIds.map((participantUserId) => ({
        conversationId,
        userId: participantUserId,
        role: 'member',
      })),
      skipDuplicates: true,
    });

    return this.findOneConversation(conversationId, userId);
  }

  // Update participant settings (mute, pin, etc.)
  async updateParticipantSettings(
    conversationId: string,
    userId: string,
    updateParticipantDto: UpdateParticipantDto,
  ) {
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });

    if (!participant || participant.leftAt) {
      throw new ForbiddenException('You are not a member of this conversation');
    }

    await this.prisma.conversationParticipant.update({
      where: { id: participant.id },
      data: updateParticipantDto,
    });

    return { message: 'Participant settings updated' };
  }

  // Leave a conversation
  async leaveConversation(conversationId: string, userId: string) {
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });

    if (!participant || participant.leftAt) {
      throw new ForbiddenException('You are not a member of this conversation');
    }

    await this.prisma.conversationParticipant.update({
      where: { id: participant.id },
      data: { leftAt: new Date() },
    });

    return { message: 'Left conversation' };
  }

  // Get messages in a conversation
  async getMessages(
    conversationId: string,
    userId: string,
    limit = 50,
    before?: string,
  ) {
    // Validate access
    await this.validateConversationAccess(conversationId, userId);

    const where: any = {
      conversationId,
      isDeleted: false,
    };

    if (before) {
      where.createdAt = { lt: new Date(before) };
    }

    const messages = await this.prisma.message.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: this.getUserSelect(),
        parentMessage: {
          include: {
            sender: this.getUserSelect(),
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });

    // Update last read timestamp
    await this.updateLastRead(conversationId, userId);

    return messages.reverse();
  }

  // Send a message
  async sendMessage(
    conversationId: string,
    userId: string,
    sendMessageDto: SendMessageDto,
  ) {
    // Validate access
    await this.validateConversationAccess(conversationId, userId);

    // Validate parent message if replying
    if (sendMessageDto.parentMessageId) {
      const parentMessage = await this.prisma.message.findFirst({
        where: {
          id: sendMessageDto.parentMessageId,
          conversationId,
        },
      });

      if (!parentMessage) {
        throw new BadRequestException('Parent message not found');
      }
    }

    // Create message
    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content: sendMessageDto.content,
        type: sendMessageDto.type || 'text',
        parentMessageId: sendMessageDto.parentMessageId,
        metadata: sendMessageDto.metadata,
      },
      include: {
        sender: this.getUserSelect(),
        parentMessage: {
          include: {
            sender: this.getUserSelect(),
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });

    // Update conversation's lastMessageAt
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    return message;
  }

  // Update message (edit)
  async updateMessage(messageId: string, userId: string, content: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    if (message.isDeleted) {
      throw new BadRequestException('Cannot edit deleted messages');
    }

    return this.prisma.message.update({
      where: { id: messageId },
      data: {
        content,
        isEdited: true,
        editedAt: new Date(),
      },
      include: {
        sender: this.getUserSelect(),
        parentMessage: {
          include: {
            sender: this.getUserSelect(),
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });
  }

  // Delete message
  async deleteMessage(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    await this.prisma.message.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return { message: 'Message deleted' };
  }

  // Helper: Validate workspace membership
  private async validateWorkspaceMembership(
    workspaceId: string,
    userId: string,
  ) {
    const member = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    return member;
  }

  // Helper: Validate conversation access
  private async validateConversationAccess(
    conversationId: string,
    userId: string,
  ) {
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });

    if (!participant || participant.leftAt) {
      throw new ForbiddenException('You do not have access to this conversation');
    }

    return participant;
  }

  // Helper: Find existing direct conversation
  private async findExistingDirectConversation(
    userId1: string,
    userId2: string,
  ) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        type: 'direct',
        participants: {
          every: {
            userId: {
              in: [userId1, userId2],
            },
            leftAt: null,
          },
        },
      },
      include: {
        participants: {
          where: { leftAt: null },
        },
      },
    });

    // Find conversation with exactly these two users
    const existingConversation = conversations.find(
      (conv) =>
        conv.participants.length === 2 &&
        conv.participants.some((p) => p.userId === userId1) &&
        conv.participants.some((p) => p.userId === userId2),
    );

    if (existingConversation) {
      return this.findOneConversation(existingConversation.id, userId1);
    }

    return null;
  }

  // Helper: Update last read timestamp
  private async updateLastRead(conversationId: string, userId: string) {
    await this.prisma.conversationParticipant.updateMany({
      where: {
        conversationId,
        userId,
      },
      data: {
        lastReadAt: new Date(),
      },
    });
  }

  // Helper: Get user select fields
  private getUserSelect() {
    return {
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        jobTitle: true,
      },
    };
  }

  // Helper: Format conversation with computed fields
  private formatConversation(conversation: any, userId: string) {
    const myParticipant = conversation.participants.find(
      (p: any) => p.userId === userId,
    );

    // Calculate unread count
    const unreadCount = myParticipant?.lastReadAt
      ? conversation._count?.messages || 0
      : 0;

    // For direct conversations, get the other user's info
    let displayName = conversation.name;
    let displayImage = null;

    if (conversation.type === 'direct') {
      const otherParticipant = conversation.participants.find(
        (p: any) => p.userId !== userId,
      );
      if (otherParticipant) {
        displayName = `${otherParticipant.user.firstName} ${otherParticipant.user.lastName}`;
        displayImage = otherParticipant.user.profileImage;
      }
    }

    return {
      ...conversation,
      displayName,
      displayImage,
      unreadCount,
      myRole: myParticipant?.role || null,
      lastMessage: conversation.messages?.[0] || null,
    };
  }
}
