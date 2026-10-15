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
import { MeetingsService } from './meetings.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { UpdateParticipantStatusDto } from './dto/update-participant-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('meetings')
@UseGuards(JwtAuthGuard)
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Post()
  create(@Request() req, @Body() createMeetingDto: CreateMeetingDto) {
    return this.meetingsService.create(req.user.userId, createMeetingDto);
  }

  @Get()
  findAll(@Request() req, @Query() query: { status?: string; type?: string }) {
    return this.meetingsService.findAll(req.user.userId, query);
  }

  @Get('upcoming')
  findUpcoming(@Request() req) {
    return this.meetingsService.findUpcoming(req.user.userId);
  }

  @Get('pending-invites')
  findPendingInvites(@Request() req) {
    return this.meetingsService.findPendingInvites(req.user.userId);
  }

  @Get('previous')
  findPrevious(@Request() req) {
    return this.meetingsService.findPrevious(req.user.userId);
  }

  @Get('today-count')
  async getTodayCount(@Request() req) {
    const count = await this.meetingsService.findTodayCount(req.user.userId);
    return { count };
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.meetingsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateMeetingDto: UpdateMeetingDto,
  ) {
    return this.meetingsService.update(id, req.user.userId, updateMeetingDto);
  }

  @Patch(':id/cancel')
  cancel(@Request() req, @Param('id') id: string) {
    return this.meetingsService.cancel(id, req.user.userId);
  }

  @Patch(':id/status')
  updateParticipantStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateParticipantStatusDto,
  ) {
    return this.meetingsService.updateParticipantStatus(
      id,
      req.user.userId,
      updateStatusDto,
    );
  }
}
