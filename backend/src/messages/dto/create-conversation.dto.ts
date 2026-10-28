import { IsString, IsOptional, IsBoolean, IsArray, IsUUID, IsIn } from 'class-validator';

export class CreateConversationDto {
  @IsString()
  @IsIn(['direct', 'group', 'channel'])
  type: string;

  @IsOptional()
  @IsUUID()
  workspaceId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  @IsArray()
  @IsUUID('4', { each: true })
  participantIds: string[]; // User IDs to add to conversation
}
