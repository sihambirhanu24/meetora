import axios from '@/lib/api/axios';
import type {
  Workspace,
  WorkspaceMember,
  WorkspaceInvitation,
  CreateWorkspaceData,
  UpdateWorkspaceData,
  InviteMemberData,
  UpdateMemberRoleData,
  RespondInvitationData,
} from '../types';

export const workspacesApi = {
  // Get all workspaces for current user
  getAllWorkspaces: async (): Promise<Workspace[]> => {
    const response = await axios.get('/workspaces');
    return response.data;
  },

  // Get single workspace by ID
  getWorkspace: async (id: string): Promise<Workspace> => {
    const response = await axios.get(`/workspaces/${id}`);
    return response.data;
  },

  // Create new workspace
  createWorkspace: async (data: CreateWorkspaceData): Promise<Workspace> => {
    const response = await axios.post('/workspaces', data);
    return response.data;
  },

  // Update workspace
  updateWorkspace: async (
    id: string,
    data: UpdateWorkspaceData,
  ): Promise<Workspace> => {
    const response = await axios.patch(`/workspaces/${id}`, data);
    return response.data;
  },

  // Delete workspace
  deleteWorkspace: async (id: string): Promise<{ message: string }> => {
    const response = await axios.delete(`/workspaces/${id}`);
    return response.data;
  },

  // Get workspace members
  getMembers: async (workspaceId: string): Promise<WorkspaceMember[]> => {
    const response = await axios.get(`/workspaces/${workspaceId}/members`);
    return response.data;
  },

  // Invite member to workspace
  inviteMember: async (
    workspaceId: string,
    data: InviteMemberData,
  ): Promise<WorkspaceInvitation> => {
    const response = await axios.post(
      `/workspaces/${workspaceId}/members/invite`,
      data,
    );
    return response.data;
  },

  // Get workspace invitations (pending)
  getInvitations: async (
    workspaceId: string,
  ): Promise<WorkspaceInvitation[]> => {
    const response = await axios.get(`/workspaces/${workspaceId}/invitations`);
    return response.data;
  },

  // Get invitations received by current user
  getMyInvitations: async (): Promise<WorkspaceInvitation[]> => {
    const response = await axios.get('/workspaces/invitations/me');
    return response.data;
  },

  // Respond to invitation
  respondToInvitation: async (
    invitationId: string,
    data: RespondInvitationData,
  ): Promise<{ message: string }> => {
    const response = await axios.post(
      `/workspaces/invitations/${invitationId}/respond`,
      data,
    );
    return response.data;
  },

  // Update member role
  updateMemberRole: async (
    workspaceId: string,
    memberId: string,
    data: UpdateMemberRoleData,
  ): Promise<WorkspaceMember> => {
    const response = await axios.patch(
      `/workspaces/${workspaceId}/members/${memberId}/role`,
      data,
    );
    return response.data;
  },

  // Remove member from workspace
  removeMember: async (
    workspaceId: string,
    memberId: string,
  ): Promise<{ message: string }> => {
    const response = await axios.delete(
      `/workspaces/${workspaceId}/members/${memberId}`,
    );
    return response.data;
  },

  // Cancel invitation
  cancelInvitation: async (
    workspaceId: string,
    invitationId: string,
  ): Promise<{ message: string }> => {
    const response = await axios.delete(
      `/workspaces/${workspaceId}/invitations/${invitationId}`,
    );
    return response.data;
  },
};
