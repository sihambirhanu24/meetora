import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';

export class UpdateMeetingDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  startTime?: string;

  @IsDateString()
  @IsOptional()
  endTime?: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsString()
  @IsOptional()
  meetingLink?: string;

  @IsEnum(['scheduled', 'in_progress', 'completed', 'cancelled'])
  @IsOptional()
  status?: string;
}
