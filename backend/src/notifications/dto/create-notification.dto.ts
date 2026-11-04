import { IsString, IsOptional, IsObject, IsEnum } from "class-validator";

export enum NotificationType {
  MEETING_INVITATION = "meeting_invitation",
  MEETING_REMINDER = "meeting_reminder",
  MEETING_STARTING = "meeting_starting",
  MEETING_CANCELLED = "meeting_cancelled",
  WORKSPACE_INVITATION = "workspace_invitation",
  WORKSPACE_MEMBER_JOINED = "workspace_member_joined",
  MESSAGE_MENTION = "message_mention",
  GENERAL = "general",
}

export class CreateNotificationDto {
  @IsString()
  userId: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsString()
  @IsOptional()
  relatedEntityType?: string;

  @IsString()
  @IsOptional()
  relatedEntityId?: string;

  @IsString()
  @IsOptional()
  actionUrl?: string;

  @IsObject()
  @IsOptional()
  metadata?: any;
}
