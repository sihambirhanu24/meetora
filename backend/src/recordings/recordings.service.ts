import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecordingDto } from './dto/create-recording.dto';
import { UpdateRecordingDto } from './dto/update-recording.dto';

@Injectable()
export class RecordingsService {
  constructor(private prisma: PrismaService) {}

  // Create a recording metadata entry (actual recording storage not implemented)
  async create(userId: string, createRecordingDto: CreateRecordingDto) {
    const { meetingId, workspaceId, ...recordingData } = createRecordingDto;

    // Verify meeting exists and user is the host
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
    });

    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    if (meeting.hostId !== userId) {
      throw new ForbiddenException('Only the meeting host can create recordings');
    }

    // If workspace is specified, verify membership
    if (workspaceId) {
      await this.validateWorkspaceMembership(workspaceId, userId);
    }

    const recording = await this.prisma.recording.create({
      data: {
        ...recordingData,
        meetingId,
        hostId: userId,
        workspaceId,
        status: 'processing', // Default status
      },
      include: {
        meeting: {
          select: {
            id: true,
            title: true,
            startTime: true,
            endTime: true,
          },
        },
      },
    });

    return this.sanitizeRecording(recording);
  }

  // Get all recordings accessible to the user
  async findAll(
    userId: string,
    filters?: {
      status?: string;
      workspaceId?: string;
      hostId?: string;
      startDate?: string;
      endDate?: string;
    },
  ) {
    const where: any = {
      OR: [
        // User is the host
        { hostId: userId },
        // Meeting where user was a participant
        {
          meeting: {
            participants: {
              some: {
                userId,
              },
            },
          },
        },
        // Public recordings
        { isPublic: true },
      ],
    };

    // Apply filters
    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.workspaceId) {
      where.workspaceId = filters.workspaceId;
      // Verify user has access to workspace
      await this.validateWorkspaceMembership(filters.workspaceId, userId);
    }

    if (filters?.hostId) {
      where.hostId = filters.hostId;
    }

    if (filters?.startDate || filters?.endDate) {
      where.recordedAt = {};
      if (filters.startDate) {
        where.recordedAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.recordedAt.lte = new Date(filters.endDate);
      }
    }

    const recordings = await this.prisma.recording.findMany({
      where,
      include: {
        meeting: {
          select: {
            id: true,
            title: true,
            startTime: true,
            endTime: true,
            host: this.getUserSelect(),
          },
        },
      },
      orderBy: {
        recordedAt: 'desc',
      },
    });

    return recordings.map((rec) => this.sanitizeRecording(rec));
  }

  // Get single recording
  async findOne(recordingId: string, userId: string) {
    const recording = await this.prisma.recording.findUnique({
      where: { id: recordingId },
      include: {
        meeting: {
          include: {
            host: this.getUserSelect(),
            participants: {
              include: {
                user: this.getUserSelect(),
              },
            },
          },
        },
      },
    });

    if (!recording) {
      throw new NotFoundException('Recording not found');
    }

    // Check if user has access
    const hasAccess = await this.checkRecordingAccess(recording, userId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this recording');
    }

    return this.sanitizeRecording(recording);
  }

  // Update recording metadata
  async update(
    recordingId: string,
    userId: string,
    updateRecordingDto: UpdateRecordingDto,
  ) {
    const recording = await this.prisma.recording.findUnique({
      where: { id: recordingId },
    });

    if (!recording) {
      throw new NotFoundException('Recording not found');
    }

    // Only host can update
    if (recording.hostId !== userId) {
      throw new ForbiddenException('Only the recording owner can update it');
    }

    const updated = await this.prisma.recording.update({
      where: { id: recordingId },
      data: updateRecordingDto,
      include: {
        meeting: {
          select: {
            id: true,
            title: true,
            startTime: true,
            endTime: true,
          },
        },
      },
    });

    return this.sanitizeRecording(updated);
  }

  // Delete recording (soft delete by setting status to 'deleted')
  async remove(recordingId: string, userId: string) {
    const recording = await this.prisma.recording.findUnique({
      where: { id: recordingId },
    });

    if (!recording) {
      throw new NotFoundException('Recording not found');
    }

    // Only host can delete
    if (recording.hostId !== userId) {
      throw new ForbiddenException('Only the recording owner can delete it');
    }

    await this.prisma.recording.update({
      where: { id: recordingId },
      data: { status: 'deleted' },
    });

    return { message: 'Recording deleted successfully' };
  }

  // Get recording by share token (for public/shared access)
  async findByShareToken(token: string) {
    const recording = await this.prisma.recording.findUnique({
      where: { shareToken: token },
      include: {
        meeting: {
          select: {
            id: true,
            title: true,
            startTime: true,
            endTime: true,
            host: this.getUserSelect(),
          },
        },
      },
    });

    if (!recording) {
      throw new NotFoundException('Recording not found');
    }

    if (recording.status !== 'available') {
      throw new ForbiddenException('Recording is not available');
    }

    return this.sanitizeRecording(recording);
  }

  // Generate share token for a recording
  async generateShareToken(recordingId: string, userId: string) {
    const recording = await this.prisma.recording.findUnique({
      where: { id: recordingId },
    });

    if (!recording) {
      throw new NotFoundException('Recording not found');
    }

    if (recording.hostId !== userId) {
      throw new ForbiddenException(
        'Only the recording owner can generate share links',
      );
    }

    const shareToken = this.generateRandomToken();

    await this.prisma.recording.update({
      where: { id: recordingId },
      data: { shareToken },
    });

    return { shareToken, shareUrl: `/recordings/shared/${shareToken}` };
  }

  // Helper: Check if user has access to recording
  private async checkRecordingAccess(recording: any, userId: string): Promise<boolean> {
    // User is the host
    if (recording.hostId === userId) {
      return true;
    }

    // Recording is public
    if (recording.isPublic) {
      return true;
    }

    // User was a participant in the meeting
    const participant = await this.prisma.meetingParticipant.findFirst({
      where: {
        meetingId: recording.meetingId,
        userId,
      },
    });

    if (participant) {
      return true;
    }

    // User is in the workspace (if recording is associated with workspace)
    if (recording.workspaceId) {
      const member = await this.prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: recording.workspaceId,
            userId,
          },
        },
      });

      if (member) {
        return true;
      }
    }

    return false;
  }

  // Helper: Validate workspace membership
  private async validateWorkspaceMembership(
    workspaceId: string,
    userId: string,
  ) {
    const member = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    return member;
  }

  // Helper: Get user select fields
  private getUserSelect() {
    return {
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        jobTitle: true,
      },
    };
  }

  // Helper: Generate random token
  private generateRandomToken(): string {
    return Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
  }

  // Helper: Sanitize recording (remove sensitive data)
  private sanitizeRecording(recording: any) {
    // Note: No actual video URLs are included because storage infrastructure is not implemented
    const { ...safe } = recording;
    return {
      ...safe,
      // Add a clear indicator that playback is not available
      playbackAvailable: false,
      limitations: 'Recording storage and playback infrastructure not implemented',
    };
  }
}
