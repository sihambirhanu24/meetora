import { IsNotEmpty, IsString } from 'class-validator';

export class SendReactionDto {
  @IsString()
  @IsNotEmpty()
  emoji: string;
}
