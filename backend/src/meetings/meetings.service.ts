import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { EmailService } from "../email/email.service";
import { NotificationsService } from "../notifications/notifications.service";
import { CreateMeetingDto } from "./dto/create-meeting.dto";
import { UpdateMeetingDto } from "./dto/update-meeting.dto";
import { UpdateParticipantStatusDto } from "./dto/update-participant-status.dto";
import { AccessToken } from "livekit-server-sdk";

@Injectable()
export class MeetingsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private notificationsService: NotificationsService,
  ) {}

  async create(userId: string, createMeetingDto: CreateMeetingDto) {
    const { participantEmails, ...meetingData } = createMeetingDto;

    // Validate that endTime is after startTime
    const startTime = new Date(createMeetingDto.startTime);
    const endTime = new Date(createMeetingDto.endTime);

    if (endTime <= startTime) {
      throw new BadRequestException("End time must be after start time");
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
        timezone: createMeetingDto.timezone || "UTC",
        meetingType: createMeetingDto.meetingType || "scheduled",
        hostId: userId,
        meetingLink:
          createMeetingDto.meetingLink ||
          `meetora.app/join/${Math.random().toString(36).substring(7)}`,
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
            status: "invited",
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
            console.error(
              `Failed to send invitation email to ${user.email}:`,
              error,
            );
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
        startTime: "asc",
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
              in: ["scheduled", "in_progress"],
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
        startTime: "asc",
      },
    });
  }

  async findPendingInvites(userId: string) {
    return this.prisma.meetingParticipant.findMany({
      where: {
        userId: userId,
        status: "invited",
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
        createdAt: "desc",
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
                status: "completed",
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
        startTime: "desc",
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
              in: ["scheduled", "in_progress"],
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
      throw new NotFoundException("Meeting not found");
    }

    // Check if user has access to this meeting
    const hasAccess =
      meeting.hostId === userId ||
      meeting.participants.some((p) => p.userId === userId);

    if (!hasAccess) {
      throw new ForbiddenException("You do not have access to this meeting");
    }

    return meeting;
  }

  async update(id: string, userId: string, updateMeetingDto: UpdateMeetingDto) {
    const meeting = await this.findOne(id, userId);

    // Only host can update meeting
    if (meeting.hostId !== userId) {
      throw new ForbiddenException("Only the host can update this meeting");
    }

    // Validate times if both are provided
    if (updateMeetingDto.startTime && updateMeetingDto.endTime) {
      const startTime = new Date(updateMeetingDto.startTime);
      const endTime = new Date(updateMeetingDto.endTime);

      if (endTime <= startTime) {
        throw new BadRequestException("End time must be after start time");
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
      throw new ForbiddenException("Only the host can cancel this meeting");
    }

    return this.prisma.meeting.update({
      where: { id },
      data: { status: "cancelled" },
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
      throw new NotFoundException("Participant not found");
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

  async getMessages(meetingId: string, userId: string) {
    // Verify user has access to meeting
    await this.findOne(meetingId, userId);

    return this.prisma.meetingMessage.findMany({
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
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async getParticipantsStatus(meetingId: string, userId: string) {
    // Verify user has access to meeting
    await this.findOne(meetingId, userId);

    return this.prisma.meetingParticipant.findMany({
      where: { meetingId },
      select: {
        userId: true,
        isHandRaised: true,
        isMuted: true,
        isCameraOff: true,
        joinedAt: true,
        leftAt: true,
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
  }

  async joinPersonalRoom(roomId: string, userId: string) {
    // Extract host user ID from personal room ID
    // Format: personal-emailusername-userid6chars
    // Example: personal-john-a1b2c3
    
    if (!roomId.startsWith('personal-')) {
      throw new BadRequestException('Invalid personal room ID');
    }

    // Extract the 6-char user ID from the end
    const parts = roomId.split('-');
    if (parts.length < 3) {
      throw new BadRequestException('Invalid personal room format');
    }
    
    const shortUserId = parts[parts.length - 1]; // Last 6 chars of user ID
    
    // Find the host user by matching the first 6 characters of their ID
    const hostUser = await this.prisma.user.findFirst({
      where: {
        id: {
          startsWith: shortUserId,
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        profileImage: true,
      },
    });

    if (!hostUser) {
      throw new NotFoundException('Personal room host not found');
    }

    // Check if an active instant meeting already exists for this personal room
    const existingMeeting = await this.prisma.meeting.findFirst({
      where: {
        hostId: hostUser.id,
        meetingType: 'instant',
        meetingLink: {
          contains: roomId,
        },
        status: 'in_progress',
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

    if (existingMeeting) {
      // Add current user as participant if not already present and not the host
      if (userId !== hostUser.id) {
        const isParticipant = existingMeeting.participants.some(
          (p) => p.userId === userId,
        );

        if (!isParticipant) {
          await this.prisma.meetingParticipant.create({
            data: {
              meetingId: existingMeeting.id,
              userId: userId,
              status: 'accepted',
            },
          });
        }
      }

      return this.findOne(existingMeeting.id, userId);
    }

    // Create new instant meeting for this personal room
    const now = new Date();
    const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    const meeting = await this.prisma.meeting.create({
      data: {
        title: `${hostUser.firstName}'s Personal Room`,
        description: `Personal meeting room for ${hostUser.firstName} ${hostUser.lastName}`,
        startTime: now,
        endTime: endTime,
        timezone: 'UTC',
        meetingType: 'instant',
        status: 'in_progress',
        hostId: hostUser.id,
        meetingLink: `${process.env.FRONTEND_URL || 'https://meetora.app'}/meetings/${roomId}`,
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

    // Add current user as participant if they're not the host
    if (userId !== hostUser.id) {
      await this.prisma.meetingParticipant.create({
        data: {
          meetingId: meeting.id,
          userId: userId,
          status: 'accepted',
        },
      });
    }

    return this.findOne(meeting.id, userId);
  }

  async getLivekitToken(meetingId: string, userId: string) {
    // Validate user has access to this meeting
    await this.findOne(meetingId, userId);

    // Get user info for identity
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, firstName: true, lastName: true },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitUrl = process.env.LIVEKIT_URL || "wss://localhost:7880";

    if (!apiKey || !apiSecret) {
      throw new BadRequestException("LiveKit is not configured on this server");
    }

    const roomName = meetingId;
    const participantIdentity = user.email;
    const participantName = `${user.firstName} ${user.lastName}`;

    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantIdentity,
      name: participantName,
      ttl: "2h",
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();

    return {
      token,
      roomName,
      livekitUrl,
    };
  }
}
