import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { UpdateParticipantStatusDto } from './dto/update-participant-status.dto';

@Injectable()
export class MeetingsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async create(userId: string, createMeetingDto: CreateMeetingDto) {
    const { participantEmails, ...meetingData } = createMeetingDto;

    // Validate that endTime is after startTime
    const startTime = new Date(createMeetingDto.startTime);
    const endTime = new Date(createMeetingDto.endTime);
    
    if (endTime <= startTime) {
      throw new BadRequestException('End time must be after start time');
    }

    // Get host information for email
    const host = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    // Create meeting
    const meeting = await this.prisma.meeting.create({
      data: {
        ...meetingData,
        startTime: new Date(createMeetingDto.startTime),
        endTime: new Date(createMeetingDto.endTime),
        timezone: createMeetingDto.timezone || 'UTC',
        meetingType: createMeetingDto.meetingType || 'scheduled',
        hostId: userId,
        meetingLink: createMeetingDto.meetingLink || `meetora.app/join/${Math.random().toString(36).substring(7)}`,
      },
      include: {
        host: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                profileImage: true,
              },
            },
          },
        },
      },
    });

    // Add participants if provided and send invitations
    if (participantEmails && participantEmails.length > 0) {
      const users = await this.prisma.user.findMany({
        where: {
          email: {
            in: participantEmails,
          },
        },
      });

      if (users.length > 0) {
        // Add participants to meeting
        await this.prisma.meetingParticipant.createMany({
          data: users.map((user) => ({
            meetingId: meeting.id,
            userId: user.id,
            status: 'invited',
          })),
        });

        // Send email invitations to each participant
        const hostName = `${host.firstName} ${host.lastName}`;
        
        for (const user of users) {
          try {
            await this.emailService.sendMeetingInvitation(user.email, {
              title: meeting.title,
              startTime: meeting.startTime,
              endTime: meeting.endTime,
              hostName,
              meetingLink: meeting.meetingLink,
              description: meeting.description,
            });
          } catch (error) {
            // Log email error but don't fail the meeting creation
            console.error(`Failed to send invitation email to ${user.email}:`, error);
          }
        }
      }
    }

    return this.findOne(meeting.id, userId);
  }

  async findAll(userId: string, query?: { status?: string; type?: string }) {
    const where: any = {
      OR: [
        { hostId: userId },
        {
          participants: {
            some: {
              userId: userId,
            },
          },
        },
      ],
    };

    if (query?.status) {
      where.status = query.status;
    }

    if (query?.type) {
      where.meetingType = query.type;
    }

    const meetings = await this.prisma.meeting.findMany({
      where,
      include: {
        host: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                profileImage: true,
              },
            },
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    return meetings;
  }

  async findUpcoming(userId: string) {
    const now = new Date();
    
    return this.prisma.meeting.findMany({
      where: {
        AND: [
          {
            OR: [
              { hostId: userId },
              {
                participants: {
                  some: {
                    userId: userId,
                  },
                },
              },
            ],
          },
          {
            startTime: {
              gte: now,
            },
          },
          {
            status: {
              in: ['scheduled', 'in_progress'],
            },
          },
        ],
      },
      include: {
        host: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                profileImage: true,
              },
            },
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }

  async findPendingInvites(userId: string) {
    return this.prisma.meetingParticipant.findMany({
      where: {
        userId: userId,
        status: 'invited',
      },
      include: {
        meeting: {
          include: {
            host: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                profileImage: true,
              },
            },
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    profileImage: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findPrevious(userId: string) {
    const now = new Date();
    
    return this.prisma.meeting.findMany({
      where: {
        AND: [
          {
            OR: [
              { hostId: userId },
              {
                participants: {
                  some: {
                    userId: userId,
                  },
                },
              },
            ],
          },
          {
            OR: [
              {
                endTime: {
                  lt: now,
                },
              },
              {
                status: 'completed',
              },
            ],
          },
        ],
      },
      include: {
        host: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                profileImage: true,
              },
            },
          },
        },
      },
      orderBy: {
        startTime: 'desc',
      },
    });
  }

  async findTodayCount(userId: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.meeting.count({
      where: {
        AND: [
          {
            OR: [
              { hostId: userId },
              {
                participants: {
                  some: {
                    userId: userId,
                  },
                },
              },
            ],
          },
          {
            startTime: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          {
            status: {
              in: ['scheduled', 'in_progress'],
            },
          },
        ],
      },
    });
  }

  async findOne(id: string, userId: string) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id },
      include: {
        host: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                profileImage: true,
              },
            },
          },
        },
      },
    });

    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    // Check if user has access to this meeting
    const hasAccess =
      meeting.hostId === userId ||
      meeting.participants.some((p) => p.userId === userId);

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this meeting');
    }

    return meeting;
  }

  async update(id: string, userId: string, updateMeetingDto: UpdateMeetingDto) {
    const meeting = await this.findOne(id, userId);

    // Only host can update meeting
    if (meeting.hostId !== userId) {
      throw new ForbiddenException('Only the host can update this meeting');
    }

    // Validate times if both are provided
    if (updateMeetingDto.startTime && updateMeetingDto.endTime) {
      const startTime = new Date(updateMeetingDto.startTime);
      const endTime = new Date(updateMeetingDto.endTime);
      
      if (endTime <= startTime) {
        throw new BadRequestException('End time must be after start time');
      }
    }

    const dataToUpdate: any = { ...updateMeetingDto };
    
    if (updateMeetingDto.startTime) {
      dataToUpdate.startTime = new Date(updateMeetingDto.startTime);
    }
    
    if (updateMeetingDto.endTime) {
      dataToUpdate.endTime = new Date(updateMeetingDto.endTime);
    }

    return this.prisma.meeting.update({
      where: { id },
      data: dataToUpdate,
      include: {
        host: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                profileImage: true,
              },
            },
          },
        },
      },
    });
  }

  async cancel(id: string, userId: string) {
    const meeting = await this.findOne(id, userId);

    // Only host can cancel meeting
    if (meeting.hostId !== userId) {
      throw new ForbiddenException('Only the host can cancel this meeting');
    }

    return this.prisma.meeting.update({
      where: { id },
      data: { status: 'cancelled' },
      include: {
        host: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                profileImage: true,
              },
            },
          },
        },
      },
    });
  }

  async updateParticipantStatus(
    meetingId: string,
    userId: string,
    updateStatusDto: UpdateParticipantStatusDto,
  ) {
    // Find participant record
    const participant = await this.prisma.meetingParticipant.findFirst({
      where: {
        meetingId,
        userId,
      },
    });

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    return this.prisma.meetingParticipant.update({
      where: { id: participant.id },
      data: { status: updateStatusDto.status },
      include: {
        meeting: {
          include: {
            host: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                profileImage: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
    });
  }
}
