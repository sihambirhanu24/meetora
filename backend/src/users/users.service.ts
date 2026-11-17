import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateProfileDto } from "./dto/update-profile.dto";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return this.sanitizeUser(user);
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Only update allowed fields
    const allowedFields = {
      firstName: updateProfileDto.firstName,
      lastName: updateProfileDto.lastName,
      bio: updateProfileDto.bio,
      jobTitle: updateProfileDto.jobTitle,
    };

    // Remove undefined fields
    const updateData = Object.fromEntries(
      Object.entries(allowedFields).filter(([_, value]) => value !== undefined),
    );

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return this.sanitizeUser(updatedUser);
  }

  async getPersonalRoom(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const roomId = userId.substring(0, 8);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3002";
    const roomUrl = `${frontendUrl}/meetings/room/${roomId}`;

    return { roomId, roomUrl };
  }

  async getActivity(userId: string) {
    const [notifications, meetings] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      this.prisma.meeting.findMany({
        where: {
          OR: [
            { hostId: userId },
            { participants: { some: { userId } } },
          ],
        },
        orderBy: { startTime: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          status: true,
          startTime: true,
          updatedAt: true,
        },
      }),
    ]);

    const notificationItems = notifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      description: n.message,
      timestamp: n.createdAt,
      url: n.actionUrl || null,
    }));

    const meetingItems = meetings.map((m) => ({
      id: m.id,
      type: "meeting",
      title: m.title,
      description: `Meeting ${m.status}`,
      timestamp: m.updatedAt,
      url: `/meetings/${m.id}`,
    }));

    // Merge and sort by timestamp descending, return top 15
    const combined = [...notificationItems, ...meetingItems].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    return combined.slice(0, 15);
  }

  async getStorageStats() {
    return {
      usedBytes: 0,
      totalBytes: 1073741824,
      usedFormatted: "0 MB",
      totalFormatted: "1 GB",
      percentage: 0,
    };
  }

  private sanitizeUser(user: any) {
    const {
      passwordHash,
      passwordResetToken,
      passwordResetExpiresAt,
      emailVerificationToken,
      emailVerificationExpiresAt,
      ...safeUser
    } = user;
    return safeUser;
  }
}

