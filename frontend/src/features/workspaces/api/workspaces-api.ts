import axios from '@/lib/api/axios';

export interface WorkspaceOwner {
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
  owner?: WorkspaceOwner;
  myRole?: string;
  memberCount?: number;
  createdAt: string;
  updatedAt: string;
}

export const workspacesApi = {
  getAllWorkspaces: async (): Promise<Workspace[]> => {
    const { data } = await axios.get('/workspaces');
    return data;
  },

  getWorkspace: async (id: string): Promise<Workspace> => {
    const { data } = await axios.get(`/workspaces/${id}`);
    return data;
  },

  getWorkspaceMembers: async (id: string): Promise<any[]> => {
    const { data } = await axios.get(`/workspaces/${id}/members`);
    return data;
  },

  createWorkspace: async (workspaceData: any): Promise<Workspace> => {
    const { data } = await axios.post('/workspaces', workspaceData);
    return data;
  },

  updateWorkspace: async (id: string, workspaceData: any): Promise<Workspace> => {
    const { data } = await axios.patch(`/workspaces/${id}`, workspaceData);
    return data;
  },

  deleteWorkspace: async (id: string): Promise<void> => {
    await axios.delete(`/workspaces/${id}`);
  },

  inviteMember: async (workspaceId: string, inviteData: any): Promise<any> => {
    const { data } = await axios.post(`/workspaces/${workspaceId}/members/invite`, inviteData);
    return data;
  },

  updateMemberRole: async (workspaceId: string, memberId: string, role: string): Promise<any> => {
    const { data } = await axios.patch(`/workspaces/${workspaceId}/members/${memberId}/role`, { role });
    return data;
  },

  removeMember: async (workspaceId: string, memberId: string): Promise<void> => {
    await axios.delete(`/workspaces/${workspaceId}/members/${memberId}`);
  },
};
