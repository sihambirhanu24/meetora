export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  jobTitle?: string;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  slug: string;
  isPublic: boolean;
  ownerId: string;
  owner: User;
  createdAt: string;
  updatedAt: string;
  myRole?: string;
  memberCount?: number;
  invitationCount?: number;
}

export interface WorkspaceMember {
  id: string;
  role: string;
  joinedAt: string;
  user: User;
}

export interface WorkspaceInvitation {
  id: string;
  workspace?: {
    id: string;
    name: string;
    slug: string;
    description?: string;
  };
  inviter: User;
  invitee?: User;
  email: string;
  role: string;
  status: string;
  token?: string;
  expiresAt: string;
  respondedAt?: string;
  createdAt: string;
}

export interface CreateWorkspaceData {
  name: string;
  description?: string;
  slug?: string;
  isPublic?: boolean;
}

export interface UpdateWorkspaceData {
  name?: string;
  description?: string;
  isPublic?: boolean;
}

export interface InviteMemberData {
  email: string;
  role: string;
}

export interface UpdateMemberRoleData {
  role: string;
}

export interface RespondInvitationData {
  status: 'accepted' | 'declined';
}
