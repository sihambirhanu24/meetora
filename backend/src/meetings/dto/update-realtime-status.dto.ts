import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateRealtimeStatusDto {
  @IsBoolean()
  @IsOptional()
  isHandRaised?: boolean;

  @IsBoolean()
  @IsOptional()
  isMuted?: boolean;

  @IsBoolean()
  @IsOptional()
  isCameraOff?: boolean;
}
