import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateParticipantStatusDto {
  @IsEnum(['accepted', 'declined', 'tentative'])
  @IsNotEmpty()
  status: string;
}
