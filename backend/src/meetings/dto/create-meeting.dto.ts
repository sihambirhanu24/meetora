import { IsString, IsNotEmpty, IsDateString, IsOptional, IsEnum, IsArray } from 'class-validator';

export class CreateMeetingDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @IsDateString()
  @IsNotEmpty()
  endTime: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsString()
  @IsOptional()
  meetingLink?: string;

  @IsEnum(['scheduled', 'instant', 'recurring'])
  @IsOptional()
  meetingType?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  participantEmails?: string[];
}
