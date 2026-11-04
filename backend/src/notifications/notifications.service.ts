import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateNotificationDto } from "./dto/create-notification.dto";

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  // Create a notification
  async create(createNotificationDto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: createNotificationDto,
    });
  }

  // Get all notifications for a user
  async findAll(userId: string, unreadOnly = false) {
    const where: any = { userId };

    if (unreadOnly) {
      where.isRead = false;
    }

    return this.prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Limit to last 50 notifications
    });
  }

  // Get unread count
  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  // Mark notification(s) as read
  async markAsRead(userId: string, notificationIds: string[]) {
    return this.prisma.notification.updateMany({
      where: {
        id: {
          in: notificationIds,
        },
        userId, // Ensure user owns these notifications
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  // Mark all as read
  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  // Delete a notification
  async remove(userId: string, notificationId: string) {
    return this.prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId, // Ensure user owns this notification
      },
    });
  }

  // Delete all read notifications
  async deleteAllRead(userId: string) {
    return this.prisma.notification.deleteMany({
      where: {
        userId,
        isRead: true,
      },
    });
  }

  // Helper method to create meeting invitation notification
  async createMeetingInvitation(
    userId: string,
    meetingTitle: string,
    meetingId: string,
    hostName: string,
  ) {
    return this.create({
      userId,
      type: "meeting_invitation" as any,
      title: "Meeting Invitation",
      message: `${hostName} invited you to "${meetingTitle}"`,
      relatedEntityType: "meeting",
      relatedEntityId: meetingId,
      actionUrl: `/meetings`,
      metadata: {
        meetingId,
        meetingTitle,
        hostName,
      },
    });
  }

  // Helper method to create workspace invitation notification
  async createWorkspaceInvitation(
    userId: string,
    workspaceName: string,
    workspaceId: string,
    inviterName: string,
  ) {
    return this.create({
      userId,
      type: "workspace_invitation" as any,
      title: "Workspace Invitation",
      message: `${inviterName} invited you to join "${workspaceName}"`,
      relatedEntityType: "workspace",
      relatedEntityId: workspaceId,
      actionUrl: `/workspaces/${workspaceId}`,
      metadata: {
        workspaceId,
        workspaceName,
        inviterName,
      },
    });
  }

  // Helper method to create meeting reminder notification
  async createMeetingReminder(
    userId: string,
    meetingTitle: string,
    meetingId: string,
    startTime: Date,
  ) {
    const minutesUntil = Math.round(
      (startTime.getTime() - Date.now()) / 1000 / 60,
    );

    return this.create({
      userId,
      type: "meeting_reminder" as any,
      title: "Meeting Starting Soon",
      message: `"${meetingTitle}" starts in ${minutesUntil} minutes`,
      relatedEntityType: "meeting",
      relatedEntityId: meetingId,
      actionUrl: `/meetings/${meetingId}`,
      metadata: {
        meetingId,
        meetingTitle,
        startTime,
      },
    });
  }
}
