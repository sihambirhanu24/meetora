import { IsString, IsOptional, IsBoolean, IsUUID, IsInt, Min } from 'class-validator';

export class CreateRecordingDto {
  @IsUUID()
  meetingId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number; // Duration in seconds

  @IsOptional()
  @IsString()
  format?: string; // e.g., "mp4", "webm"

  @IsOptional()
  @IsUUID()
  workspaceId?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
