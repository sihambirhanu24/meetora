import { IsOptional, IsBoolean, IsDateString, IsIn } from 'class-validator';

export class UpdateParticipantDto {
  @IsOptional()
  @IsIn(['admin', 'member'])
  role?: string;

  @IsOptional()
  @IsBoolean()
  isMuted?: boolean;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @IsOptional()
  @IsDateString()
  lastReadAt?: string;
}
