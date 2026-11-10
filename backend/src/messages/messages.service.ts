import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';
import { AddParticipantsDto } from './dto/add-participants.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  // ==================== CONVERSATIONS ====================

  async createConversation(userId: string, dto: CreateConversationDto) {
    // Validate type-specific requirements
    if (dto.type === 'channel' && !dto.workspaceId) {
      throw new BadRequestException('Workspace ID is required for channels');
    }

    if (dto.type === 'channel' && !dto.name) {
      throw new BadRequestException('Channel name is required');
    }

    if (dto.type === 'direct' && dto.participantIds.length !== 1) {
      throw new BadRequestException(
        'Direct conversations must have exactly one other participant',
      );
    }

    // For channels, verify user is a workspace member
    if (dto.type === 'channel' && dto.workspaceId) {
      const membership = await this.prisma.workspaceMember.findFirst({
        where: {
          workspaceId: dto.workspaceId,
          userId,
        },
      });

      if (!membership) {
        throw new ForbiddenException('You are not a member of this workspace');
      }
    }

    // Check if direct conversation already exists
    if (dto.type === 'direct') {
      const existingConversation = await this.findExistingDirectConversation(
        userId,
        dto.participantIds[0],
      );
      if (existingConversation) {
        return existingConversation;
      }
    }

    // Create conversation with participants
    const conversation = await this.prisma.conversation.create({
      data: {
        type: dto.type,
        workspaceId: dto.workspaceId,
        name: dto.name,
        description: dto.description,
        isPrivate: dto.isPrivate ?? false,
        createdById: userId,
        participants: {
          create: [
            {
              userId,
              role: dto.type === 'channel' ? 'admin' : 'member',
            },
            ...dto.participantIds.map((participantId) => ({
              userId: participantId,
              role: 'member',
            })),
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                profileImage: true,
                jobTitle: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImage: true,
          },
        },
      },
    });

    return conversation;
  }

  async findExistingDirectConversation(userId1: string, userId2: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        type: 'direct',
        participants: {
          some: {
            userId: userId1,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                profileImage: true,
                jobTitle: true,
              },
            },
          },
        },
      },
    });

    // Find the conversation where both users are participants
    return conversations.find((conv) => {
      const participantIds = conv.participants.map((p) => p.userId);
      return participantIds.includes(userId1) && participantIds.includes(userId2);
    });
  }

  async getUserConversations(userId: string, workspaceId?: string) {
    const where: any = {
      participants: {
        some: {
          userId,
          leftAt: null,
        },
      },
    };

    if (workspaceId) {
      where.workspaceId = workspaceId;
    }

    const conversations = await this.prisma.conversation.findMany({
      where,
      include: {
        participants: {
          where: {
            leftAt: null,
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                profileImage: true,
                jobTitle: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    });

    // Calculate unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const participant = conv.participants.find((p) => p.userId === userId);
        const unreadCount = await this.prisma.message.count({
          where: {
            conversationId: conv.id,
            createdAt: {
              gt: participant?.lastReadAt || new Date(0),
            },
            senderId: {
              not: userId,
            },
          },
        });

        return {
          ...conv,
          unreadCount,
          currentUserParticipant: participant,
        };
      }),
    );

    return conversationsWithUnread;
  }

  async getConversation(userId: string, conversationId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          where: {
            leftAt: null,
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                profileImage: true,
                jobTitle: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Check if user is a participant
    const isParticipant = conversation.participants.some(
      (p) => p.userId === userId,
    );

    if (!isParticipant) {
      throw new ForbiddenException(
        'You do not have access to this conversation',
      );
    }

    return conversation;
  }

  async updateConversation(
    userId: string,
    conversationId: string,
    dto: UpdateConversationDto,
  ) {
    const conversation = await this.getConversation(userId, conversationId);

    // Only channel admins or conversation creator can update
    const participant = conversation.participants.find((p) => p.userId === userId);

    if (
      conversation.type === 'channel' &&
      participant?.role !== 'admin' &&
      conversation.createdById !== userId
    ) {
      throw new ForbiddenException(
        'Only channel admins can update the channel',
      );
    }

    if (conversation.type !== 'channel') {
      throw new BadRequestException(
        'Only channels can be updated',
      );
    }

    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        name: dto.name,
        description: dto.description,
        isPrivate: dto.isPrivate,
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                profileImage: true,
              },
            },
          },
        },
      },
    });
  }

  async deleteConversation(userId: string, conversationId: string) {
    const conversation = await this.getConversation(userId, conversationId);

    // Only creator can delete
    if (conversation.createdById !== userId) {
      throw new ForbiddenException('Only the creator can delete this conversation');
    }

    await this.prisma.conversation.delete({
      where: { id: conversationId },
    });

    return { message: 'Conversation deleted successfully' };
  }

  // ==================== PARTICIPANTS ====================

  async addParticipants(
    userId: string,
    conversationId: string,
    dto: AddParticipantsDto,
  ) {
    const conversation = await this.getConversation(userId, conversationId);

    // Only admins can add participants to channels
    if (conversation.type === 'channel') {
      const participant = conversation.participants.find(
        (p) => p.userId === userId,
      );
      if (participant?.role !== 'admin') {
        throw new ForbiddenException(
          'Only channel admins can add participants',
        );
      }
    }

    // Cannot add participants to direct messages
    if (conversation.type === 'direct') {
      throw new BadRequestException(
        'Cannot add participants to direct messages',
      );
    }

    // Add participants
    const newParticipants = await Promise.all(
      dto.userIds.map((userId) =>
        this.prisma.conversationParticipant.create({
          data: {
            conversationId,
            userId,
            role: 'member',
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                profileImage: true,
              },
            },
          },
        }),
      ),
    );

    return newParticipants;
  }

  async removeParticipant(
    userId: string,
    conversationId: string,
    participantUserId: string,
  ) {
    const conversation = await this.getConversation(userId, conversationId);

    // Check permissions
    const isAdmin = conversation.participants.find(
      (p) => p.userId === userId && p.role === 'admin',
    );

    const isSelf = userId === participantUserId;

    if (!isAdmin && !isSelf) {
      throw new ForbiddenException(
        'You do not have permission to remove this participant',
      );
    }

    // Cannot remove creator from channel
    if (conversation.createdById === participantUserId) {
      throw new BadRequestException('Cannot remove the channel creator');
    }

    // Mark as left instead of deleting
    await this.prisma.conversationParticipant.updateMany({
      where: {
        conversationId,
        userId: participantUserId,
      },
      data: {
        leftAt: new Date(),
      },
    });

    return { message: 'Participant removed successfully' };
  }

  async updateParticipant(
    userId: string,
    conversationId: string,
    participantUserId: string,
    dto: UpdateParticipantDto,
  ) {
    const conversation = await this.getConversation(userId, conversationId);

    // User can only update their own participant record for mute/pin
    // Only admins can change roles
    const isSelf = userId === participantUserId;
    const isAdmin = conversation.participants.find(
      (p) => p.userId === userId && p.role === 'admin',
    );

    if (dto.role && !isAdmin) {
      throw new ForbiddenException('Only admins can change participant roles');
    }

    if (!isSelf && !isAdmin) {
      throw new ForbiddenException(
        'You do not have permission to update this participant',
      );
    }

    const participant = await this.prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId: participantUserId,
      },
    });

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    return this.prisma.conversationParticipant.update({
      where: { id: participant.id },
      data: {
        role: dto.role,
        isMuted: dto.isMuted,
        isPinned: dto.isPinned,
        lastReadAt: dto.lastReadAt ? new Date(dto.lastReadAt) : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImage: true,
          },
        },
      },
    });
  }

  // ==================== MESSAGES ====================

  async sendMessage(
    userId: string,
    conversationId: string,
    dto: SendMessageDto,
  ) {
    const conversation = await this.getConversation(userId, conversationId);

    // Verify user is a participant
    const isParticipant = conversation.participants.some(
      (p) => p.userId === userId,
    );

    if (!isParticipant) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    // If replying, verify parent message exists
    if (dto.parentMessageId) {
      const parentMessage = await this.prisma.message.findUnique({
        where: { id: dto.parentMessageId },
      });

      if (!parentMessage || parentMessage.conversationId !== conversationId) {
        throw new BadRequestException('Invalid parent message');
      }
    }

    // Create message
    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content: dto.content,
        type: dto.type || 'text',
        parentMessageId: dto.parentMessageId,
        metadata: dto.metadata,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImage: true,
          },
        },
        parentMessage: {
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    // Update conversation lastMessageAt
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
      },
    });

    return message;
  }

  async getMessages(
    userId: string,
    conversationId: string,
    limit: number = 50,
    before?: string,
  ) {
    // Verify access
    await this.getConversation(userId, conversationId);

    const where: any = {
      conversationId,
      isDeleted: false,
    };

    if (before) {
      const beforeMessage = await this.prisma.message.findUnique({
        where: { id: before },
      });
      if (beforeMessage) {
        where.createdAt = {
          lt: beforeMessage.createdAt,
        };
      }
    }

    const messages = await this.prisma.message.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImage: true,
          },
        },
        parentMessage: {
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return messages.reverse(); // Return in chronological order
  }

  async deleteMessage(userId: string, messageId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: {
        conversation: true,
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Only sender can delete their message
    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    // Soft delete
    await this.prisma.message.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return { message: 'Message deleted successfully' };
  }

  async markAsRead(userId: string, conversationId: string) {
    // Verify access
    await this.getConversation(userId, conversationId);

    // Update participant's lastReadAt
    const participant = await this.prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
      },
    });

    if (!participant) {
      throw new NotFoundException('Participant record not found');
    }

    await this.prisma.conversationParticipant.update({
      where: { id: participant.id },
      data: {
        lastReadAt: new Date(),
      },
    });

    return { message: 'Conversation marked as read' };
  }
}
