import { IsEmail, IsString, IsIn, IsNotEmpty } from 'class-validator';

export class InviteMemberDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsIn(['admin', 'member', 'guest'])
  role: string;
}
