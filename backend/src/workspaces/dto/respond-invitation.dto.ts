import { IsString, IsIn } from 'class-validator';

export class RespondInvitationDto {
  @IsString()
  @IsIn(['accepted', 'declined'])
  status: string;
}
