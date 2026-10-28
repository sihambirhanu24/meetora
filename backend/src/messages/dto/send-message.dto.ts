import { IsString, IsOptional, IsUUID, IsIn, MaxLength } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @MaxLength(10000)
  content: string;

  @IsOptional()
  @IsString()
  @IsIn(['text', 'file', 'image', 'system'])
  type?: string;

  @IsOptional()
  @IsUUID()
  parentMessageId?: string;

  @IsOptional()
  metadata?: any; // For attachments, mentions, etc.
}
