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
import { RecordingsService } from './recordings.service';
import { CreateRecordingDto } from './dto/create-recording.dto';
import { UpdateRecordingDto } from './dto/update-recording.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('recordings')
export class RecordingsController {
  constructor(private readonly recordingsService: RecordingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() createRecordingDto: CreateRecordingDto) {
    return this.recordingsService.create(req.user.id, createRecordingDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Request() req,
    @Query('status') status?: string,
    @Query('workspaceId') workspaceId?: string,
    @Query('hostId') hostId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.recordingsService.findAll(req.user.id, {
      status,
      workspaceId,
      hostId,
      startDate,
      endDate,
    });
  }

  @Get('shared/:token')
  findByShareToken(@Param('token') token: string) {
    return this.recordingsService.findByShareToken(token);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Request() req, @Param('id') id: string) {
    return this.recordingsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateRecordingDto: UpdateRecordingDto,
  ) {
    return this.recordingsService.update(
      id,
      req.user.id,
      updateRecordingDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Request() req, @Param('id') id: string) {
    return this.recordingsService.remove(id, req.user.id);
  }

  @Post(':id/share')
  @UseGuards(JwtAuthGuard)
  generateShareToken(@Request() req, @Param('id') id: string) {
    return this.recordingsService.generateShareToken(id, req.user.id);
  }
}
