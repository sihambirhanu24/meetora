import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { MarkReadDto } from "./dto/mark-read.dto";

@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll(@Request() req, @Query("unreadOnly") unreadOnly?: string) {
    const isUnreadOnly = unreadOnly === "true";
    return this.notificationsService.findAll(req.user.id, isUnreadOnly);
  }

  @Get("unread-count")
  async getUnreadCount(@Request() req) {
    const count = await this.notificationsService.getUnreadCount(req.user.id);
    return { count };
  }

  @Post("mark-read")
  async markAsRead(@Request() req, @Body() markReadDto: MarkReadDto) {
    await this.notificationsService.markAsRead(
      req.user.id,
      markReadDto.notificationIds,
    );
    return { message: "Notifications marked as read" };
  }

  @Post("mark-all-read")
  async markAllAsRead(@Request() req) {
    await this.notificationsService.markAllAsRead(req.user.id);
    return { message: "All notifications marked as read" };
  }

  @Delete(":id")
  async remove(@Request() req, @Param("id") id: string) {
    await this.notificationsService.remove(req.user.id, id);
    return { message: "Notification deleted" };
  }

  @Delete("read/all")
  async deleteAllRead(@Request() req) {
    await this.notificationsService.deleteAllRead(req.user.id);
    return { message: "All read notifications deleted" };
  }
}
