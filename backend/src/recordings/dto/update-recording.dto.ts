import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateRecordingDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
