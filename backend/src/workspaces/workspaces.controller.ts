import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { RespondInvitationDto } from './dto/respond-invitation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: any,
    @Body() createWorkspaceDto: CreateWorkspaceDto,
  ) {
    return this.workspacesService.create(user.id, createWorkspaceDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@CurrentUser() user: any) {
    return this.workspacesService.findAll(user.id);
  }

  @Get('invitations/me')
  @HttpCode(HttpStatus.OK)
  getMyInvitations(@CurrentUser() user: any) {
    return this.workspacesService.getMyInvitations(user.id);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.workspacesService.findOne(id, user.id);
  }

  @Patch(':id')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
  ) {
    return this.workspacesService.update(id, user.id, updateWorkspaceDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.workspacesService.remove(id, user.id);
  }

  @Get(':id/members')
  @HttpCode(HttpStatus.OK)
  getMembers(@Param('id') id: string, @CurrentUser() user: any) {
    return this.workspacesService.getMembers(id, user.id);
  }

  @Post(':id/members/invite')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  inviteMember(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() inviteMemberDto: InviteMemberDto,
  ) {
    return this.workspacesService.inviteMember(id, user.id, inviteMemberDto);
  }

  @Get(':id/invitations')
  @HttpCode(HttpStatus.OK)
  getInvitations(@Param('id') id: string, @CurrentUser() user: any) {
    return this.workspacesService.getInvitations(id, user.id);
  }

  @Post('invitations/:invitationId/respond')
  @HttpCode(HttpStatus.OK)
  respondToInvitation(
    @Param('invitationId') invitationId: string,
    @CurrentUser() user: any,
    @Body() respondDto: RespondInvitationDto,
  ) {
    return this.workspacesService.respondToInvitation(
      invitationId,
      user.id,
      respondDto,
    );
  }

  @Patch(':id/members/:memberId/role')
  @HttpCode(HttpStatus.OK)
  updateMemberRole(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: any,
    @Body() updateRoleDto: UpdateMemberRoleDto,
  ) {
    return this.workspacesService.updateMemberRole(
      id,
      memberId,
      user.id,
      updateRoleDto,
    );
  }

  @Delete(':id/members/:memberId')
  @HttpCode(HttpStatus.OK)
  removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: any,
  ) {
    return this.workspacesService.removeMember(id, memberId, user.id);
  }

  @Delete(':id/invitations/:invitationId')
  @HttpCode(HttpStatus.OK)
  cancelInvitation(
    @Param('id') id: string,
    @Param('invitationId') invitationId: string,
    @CurrentUser() user: any,
  ) {
    return this.workspacesService.cancelInvitation(id, invitationId, user.id);
  }
}
