import { IsString, IsIn } from 'class-validator';

export class UpdateMemberRoleDto {
  @IsString()
  @IsIn(['owner', 'admin', 'member', 'guest'])
  role: string;
}
