import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { RespondInvitationDto } from './dto/respond-invitation.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class WorkspacesService {
  constructor(private prisma: PrismaService) {}

  // Generate a unique slug from workspace name
  private async generateSlug(name: string, attempt = 0): Promise<string> {
    let slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    if (attempt > 0) {
      slug = `${slug}-${attempt}`;
    }

    const existing = await this.prisma.workspace.findUnique({
      where: { slug },
    });

    if (existing) {
      return this.generateSlug(name, attempt + 1);
    }

    return slug;
  }

  // Create a new workspace
  async create(userId: string, createWorkspaceDto: CreateWorkspaceDto) {
    const slug = createWorkspaceDto.slug || await this.generateSlug(createWorkspaceDto.name);

    // Check if slug is already taken
    if (createWorkspaceDto.slug) {
      const existing = await this.prisma.workspace.findUnique({
        where: { slug },
      });
      if (existing) {
        throw new ConflictException('Workspace slug is already taken');
      }
    }

    const workspace = await this.prisma.workspace.create({
      data: {
        name: createWorkspaceDto.name,
        description: createWorkspaceDto.description,
        slug,
        isPublic: createWorkspaceDto.isPublic ?? false,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: 'owner',
          },
        },
      },
      include: {
        owner: this.getUserSelect(),
        members: {
          include: {
            user: this.getUserSelect(),
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    return this.sanitizeWorkspace(workspace);
  }

  // Get all workspaces for a user
  async findAll(userId: string) {
    const workspaces = await this.prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        owner: this.getUserSelect(),
        members: {
          where: {
            userId,
          },
          select: {
            role: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return workspaces.map((workspace) => ({
      ...this.sanitizeWorkspace(workspace),
      myRole: workspace.members[0]?.role || null,
      memberCount: workspace._count.members,
    }));
  }

  // Get a single workspace by ID
  async findOne(workspaceId: string, userId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        owner: this.getUserSelect(),
        members: {
          include: {
            user: this.getUserSelect(),
          },
          orderBy: {
            joinedAt: 'desc',
          },
        },
        _count: {
          select: {
            members: true,
            invitations: true,
          },
        },
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    // Check if user is a member
    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    return {
      ...this.sanitizeWorkspace(workspace),
      myRole: membership.role,
      memberCount: workspace._count.members,
      invitationCount: workspace._count.invitations,
    };
  }

  // Update workspace
  async update(
    workspaceId: string,
    userId: string,
    updateWorkspaceDto: UpdateWorkspaceDto,
  ) {
    await this.checkPermission(workspaceId, userId, ['owner', 'admin']);

    const workspace = await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: updateWorkspaceDto,
      include: {
        owner: this.getUserSelect(),
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    return this.sanitizeWorkspace(workspace);
  }

  // Delete workspace
  async remove(workspaceId: string, userId: string) {
    await this.checkPermission(workspaceId, userId, ['owner']);

    await this.prisma.workspace.delete({
      where: { id: workspaceId },
    });

    return { message: 'Workspace deleted successfully' };
  }

  // Get workspace members
  async getMembers(workspaceId: string, userId: string) {
    await this.checkMembership(workspaceId, userId);

    const members = await this.prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: this.getUserSelect(),
      },
      orderBy: {
        joinedAt: 'desc',
      },
    });

    return members.map((member) => ({
      id: member.id,
      role: member.role,
      joinedAt: member.joinedAt,
      user: member.user,
    }));
  }

  // Invite member to workspace
  async inviteMember(
    workspaceId: string,
    userId: string,
    inviteMemberDto: InviteMemberDto,
  ) {
    await this.checkPermission(workspaceId, userId, ['owner', 'admin']);

    // Check if user being invited already exists
    const invitee = await this.prisma.user.findUnique({
      where: { email: inviteMemberDto.email },
    });

    // Check if already a member
    if (invitee) {
      const existingMember = await this.prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId: invitee.id,
          },
        },
      });

      if (existingMember) {
        throw new ConflictException('User is already a member of this workspace');
      }
    }

    // Check for pending invitation
    const pendingInvitation = await this.prisma.workspaceInvitation.findFirst({
      where: {
        workspaceId,
        email: inviteMemberDto.email,
        status: 'pending',
      },
    });

    if (pendingInvitation) {
      throw new ConflictException('An invitation is already pending for this email');
    }

    // Create invitation
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    const invitation = await this.prisma.workspaceInvitation.create({
      data: {
        workspaceId,
        inviterId: userId,
        inviteeId: invitee?.id,
        email: inviteMemberDto.email,
        role: inviteMemberDto.role,
        token,
        expiresAt,
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        inviter: this.getUserSelect(),
        invitee: this.getUserSelect(),
      },
    });

    return {
      id: invitation.id,
      workspace: invitation.workspace,
      inviter: invitation.inviter,
      invitee: invitation.invitee,
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      token: invitation.token,
      expiresAt: invitation.expiresAt,
      createdAt: invitation.createdAt,
    };
  }

  // Get pending invitations for a workspace
  async getInvitations(workspaceId: string, userId: string) {
    await this.checkPermission(workspaceId, userId, ['owner', 'admin']);

    const invitations = await this.prisma.workspaceInvitation.findMany({
      where: {
        workspaceId,
        status: 'pending',
      },
      include: {
        inviter: this.getUserSelect(),
        invitee: this.getUserSelect(),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return invitations.map((inv) => ({
      id: inv.id,
      email: inv.email,
      role: inv.role,
      status: inv.status,
      inviter: inv.inviter,
      invitee: inv.invitee,
      expiresAt: inv.expiresAt,
      createdAt: inv.createdAt,
    }));
  }

  // Get invitations received by user
  async getMyInvitations(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    const invitations = await this.prisma.workspaceInvitation.findMany({
      where: {
        email: user.email,
        status: 'pending',
        expiresAt: {
          gte: new Date(),
        },
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
          },
        },
        inviter: this.getUserSelect(),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return invitations;
  }

  // Respond to invitation
  async respondToInvitation(
    invitationId: string,
    userId: string,
    respondDto: RespondInvitationDto,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    const invitation = await this.prisma.workspaceInvitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.email !== user.email) {
      throw new ForbiddenException('This invitation is not for you');
    }

    if (invitation.status !== 'pending') {
      throw new BadRequestException('Invitation has already been responded to');
    }

    if (invitation.expiresAt < new Date()) {
      throw new BadRequestException('Invitation has expired');
    }

    // Update invitation status
    await this.prisma.workspaceInvitation.update({
      where: { id: invitationId },
      data: {
        status: respondDto.status,
        inviteeId: userId,
        respondedAt: new Date(),
      },
    });

    // If accepted, add user to workspace
    if (respondDto.status === 'accepted') {
      await this.prisma.workspaceMember.create({
        data: {
          workspaceId: invitation.workspaceId,
          userId,
          role: invitation.role,
        },
      });
    }

    return { message: `Invitation ${respondDto.status}` };
  }

  // Update member role
  async updateMemberRole(
    workspaceId: string,
    memberId: string,
    userId: string,
    updateRoleDto: UpdateMemberRoleDto,
  ) {
    await this.checkPermission(workspaceId, userId, ['owner', 'admin']);

    const member = await this.prisma.workspaceMember.findUnique({
      where: { id: memberId },
      include: {
        workspace: true,
      },
    });

    if (!member || member.workspaceId !== workspaceId) {
      throw new NotFoundException('Member not found in this workspace');
    }

    // Cannot change owner role
    if (member.role === 'owner') {
      throw new ForbiddenException('Cannot change the role of the workspace owner');
    }

    // Only owner can create admins
    if (updateRoleDto.role === 'admin') {
      const requester = await this.prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId,
          },
        },
      });

      if (requester.role !== 'owner') {
        throw new ForbiddenException('Only workspace owner can assign admin role');
      }
    }

    const updated = await this.prisma.workspaceMember.update({
      where: { id: memberId },
      data: { role: updateRoleDto.role },
      include: {
        user: this.getUserSelect(),
      },
    });

    return {
      id: updated.id,
      role: updated.role,
      user: updated.user,
    };
  }

  // Remove member from workspace
  async removeMember(workspaceId: string, memberId: string, userId: string) {
    await this.checkPermission(workspaceId, userId, ['owner', 'admin']);

    const member = await this.prisma.workspaceMember.findUnique({
      where: { id: memberId },
    });

    if (!member || member.workspaceId !== workspaceId) {
      throw new NotFoundException('Member not found in this workspace');
    }

    // Cannot remove owner
    if (member.role === 'owner') {
      throw new ForbiddenException('Cannot remove the workspace owner');
    }

    await this.prisma.workspaceMember.delete({
      where: { id: memberId },
    });

    return { message: 'Member removed from workspace' };
  }

  // Cancel invitation
  async cancelInvitation(workspaceId: string, invitationId: string, userId: string) {
    await this.checkPermission(workspaceId, userId, ['owner', 'admin']);

    const invitation = await this.prisma.workspaceInvitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation || invitation.workspaceId !== workspaceId) {
      throw new NotFoundException('Invitation not found');
    }

    await this.prisma.workspaceInvitation.update({
      where: { id: invitationId },
      data: {
        status: 'cancelled',
      },
    });

    return { message: 'Invitation cancelled' };
  }

  // Helper: Check if user is a member of workspace
  private async checkMembership(workspaceId: string, userId: string) {
    const member = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    return member;
  }

  // Helper: Check if user has required permission
  private async checkPermission(
    workspaceId: string,
    userId: string,
    allowedRoles: string[],
  ) {
    const member = await this.checkMembership(workspaceId, userId);

    if (!allowedRoles.includes(member.role)) {
      throw new ForbiddenException('You do not have permission to perform this action');
    }

    return member;
  }

  // Helper: Get user select fields (exclude sensitive data)
  private getUserSelect() {
    return {
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        jobTitle: true,
      },
    };
  }

  // Helper: Sanitize workspace data
  private sanitizeWorkspace(workspace: any) {
    const { ...safe } = workspace;
    return safe;
  }
}
