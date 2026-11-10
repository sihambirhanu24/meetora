import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';
import { AddParticipantsDto } from './dto/add-participants.dto';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  // ==================== CONVERSATIONS ====================

  @Post('conversations')
  async createConversation(
    @Request() req,
    @Body() createConversationDto: CreateConversationDto,
  ) {
    return this.messagesService.createConversation(
      req.user.userId,
      createConversationDto,
    );
  }

  @Get('conversations')
  async getUserConversations(
    @Request() req,
    @Query('workspaceId') workspaceId?: string,
  ) {
    return this.messagesService.getUserConversations(
      req.user.userId,
      workspaceId,
    );
  }

  @Get('conversations/:id')
  async getConversation(@Request() req, @Param('id') id: string) {
    return this.messagesService.getConversation(req.user.userId, id);
  }

  @Put('conversations/:id')
  async updateConversation(
    @Request() req,
    @Param('id') id: string,
    @Body() updateConversationDto: UpdateConversationDto,
  ) {
    return this.messagesService.updateConversation(
      req.user.userId,
      id,
      updateConversationDto,
    );
  }

  @Delete('conversations/:id')
  async deleteConversation(@Request() req, @Param('id') id: string) {
    return this.messagesService.deleteConversation(req.user.userId, id);
  }

  // ==================== PARTICIPANTS ====================

  @Post('conversations/:id/participants')
  async addParticipants(
    @Request() req,
    @Param('id') id: string,
    @Body() addParticipantsDto: AddParticipantsDto,
  ) {
    return this.messagesService.addParticipants(
      req.user.userId,
      id,
      addParticipantsDto,
    );
  }

  @Delete('conversations/:id/participants/:userId')
  async removeParticipant(
    @Request() req,
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.messagesService.removeParticipant(req.user.userId, id, userId);
  }

  @Put('conversations/:id/participants/:userId')
  async updateParticipant(
    @Request() req,
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() updateParticipantDto: UpdateParticipantDto,
  ) {
    return this.messagesService.updateParticipant(
      req.user.userId,
      id,
      userId,
      updateParticipantDto,
    );
  }

  // ==================== MESSAGES ====================

  @Post('conversations/:id/messages')
  async sendMessage(
    @Request() req,
    @Param('id') id: string,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    return this.messagesService.sendMessage(req.user.userId, id, sendMessageDto);
  }

  @Get('conversations/:id/messages')
  async getMessages(
    @Request() req,
    @Param('id') id: string,
    @Query('limit') limit?: string,
    @Query('before') before?: string,
  ) {
    return this.messagesService.getMessages(
      req.user.userId,
      id,
      limit ? parseInt(limit, 10) : 50,
      before,
    );
  }

  @Delete('messages/:id')
  async deleteMessage(@Request() req, @Param('id') id: string) {
    return this.messagesService.deleteMessage(req.user.userId, id);
  }

  @Post('conversations/:id/read')
  async markAsRead(@Request() req, @Param('id') id: string) {
    return this.messagesService.markAsRead(req.user.userId, id);
  }
}
