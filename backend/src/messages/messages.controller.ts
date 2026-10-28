import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { AddParticipantsDto } from './dto/add-participants.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  // Conversation endpoints
  @Post('conversations')
  createConversation(
    @Request() req,
    @Body() createConversationDto: CreateConversationDto,
  ) {
    return this.messagesService.createConversation(
      req.user.id,
      createConversationDto,
    );
  }

  @Get('conversations')
  findAllConversations(@Request() req, @Query('workspaceId') workspaceId?: string) {
    return this.messagesService.findAllConversations(req.user.id, workspaceId);
  }

  @Get('conversations/:id')
  findOneConversation(@Request() req, @Param('id') id: string) {
    return this.messagesService.findOneConversation(id, req.user.id);
  }

  @Patch('conversations/:id')
  updateConversation(
    @Request() req,
    @Param('id') id: string,
    @Body() updateConversationDto: UpdateConversationDto,
  ) {
    return this.messagesService.updateConversation(
      id,
      req.user.id,
      updateConversationDto,
    );
  }

  @Post('conversations/:id/participants')
  addParticipants(
    @Request() req,
    @Param('id') id: string,
    @Body() addParticipantsDto: AddParticipantsDto,
  ) {
    return this.messagesService.addParticipants(
      id,
      req.user.id,
      addParticipantsDto,
    );
  }

  @Patch('conversations/:id/settings')
  updateParticipantSettings(
    @Request() req,
    @Param('id') id: string,
    @Body() updateParticipantDto: UpdateParticipantDto,
  ) {
    return this.messagesService.updateParticipantSettings(
      id,
      req.user.id,
      updateParticipantDto,
    );
  }

  @Post('conversations/:id/leave')
  leaveConversation(@Request() req, @Param('id') id: string) {
    return this.messagesService.leaveConversation(id, req.user.id);
  }

  // Message endpoints
  @Get('conversations/:id/messages')
  getMessages(
    @Request() req,
    @Param('id') id: string,
    @Query('limit') limit?: string,
    @Query('before') before?: string,
  ) {
    return this.messagesService.getMessages(
      id,
      req.user.id,
      limit ? parseInt(limit) : 50,
      before,
    );
  }

  @Post('conversations/:id/messages')
  sendMessage(
    @Request() req,
    @Param('id') id: string,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    return this.messagesService.sendMessage(id, req.user.id, sendMessageDto);
  }

  @Patch('messages/:id')
  updateMessage(
    @Request() req,
    @Param('id') id: string,
    @Body('content') content: string,
  ) {
    return this.messagesService.updateMessage(id, req.user.id, content);
  }

  @Delete('messages/:id')
  deleteMessage(@Request() req, @Param('id') id: string) {
    return this.messagesService.deleteMessage(id, req.user.id);
  }
}
