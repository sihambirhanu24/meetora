import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { workspacesApi } from '../api/workspaces-api';
import type {
  CreateWorkspaceData,
  UpdateWorkspaceData,
  InviteMemberData,
  UpdateMemberRoleData,
  RespondInvitationData,
} from '../types';

// Get all workspaces
export const useWorkspaces = () => {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: workspacesApi.getAllWorkspaces,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get single workspace
export const useWorkspace = (id: string) => {
  return useQuery({
    queryKey: ['workspace', id],
    queryFn: () => workspacesApi.getWorkspace(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

// Create workspace
export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkspaceData) =>
      workspacesApi.createWorkspace(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
};

// Update workspace
export const useUpdateWorkspace = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateWorkspaceData) =>
      workspacesApi.updateWorkspace(workspaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
};

// Delete workspace
export const useDeleteWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workspaceId: string) =>
      workspacesApi.deleteWorkspace(workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
};

// Get workspace members
export const useWorkspaceMembers = (workspaceId: string) => {
  return useQuery({
    queryKey: ['workspace', workspaceId, 'members'],
    queryFn: () => workspacesApi.getMembers(workspaceId),
    enabled: !!workspaceId,
    staleTime: 1 * 60 * 1000,
  });
};

// Invite member
export const useInviteMember = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InviteMemberData) =>
      workspacesApi.inviteMember(workspaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['workspace', workspaceId, 'invitations'],
      });
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] });
    },
  });
};

// Get workspace invitations
export const useWorkspaceInvitations = (workspaceId: string) => {
  return useQuery({
    queryKey: ['workspace', workspaceId, 'invitations'],
    queryFn: () => workspacesApi.getInvitations(workspaceId),
    enabled: !!workspaceId,
    staleTime: 1 * 60 * 1000,
  });
};

// Get my invitations
export const useMyInvitations = () => {
  return useQuery({
    queryKey: ['myInvitations'],
    queryFn: workspacesApi.getMyInvitations,
    staleTime: 1 * 60 * 1000,
  });
};

// Respond to invitation
export const useRespondToInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      invitationId,
      data,
    }: {
      invitationId: string;
      data: RespondInvitationData;
    }) => workspacesApi.respondToInvitation(invitationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myInvitations'] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
};

// Update member role
export const useUpdateMemberRole = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      data,
    }: {
      memberId: string;
      data: UpdateMemberRoleData;
    }) => workspacesApi.updateMemberRole(workspaceId, memberId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['workspace', workspaceId, 'members'],
      });
    },
  });
};

// Remove member
export const useRemoveMember = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) =>
      workspacesApi.removeMember(workspaceId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['workspace', workspaceId, 'members'],
      });
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] });
    },
  });
};

// Cancel invitation
export const useCancelInvitation = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) =>
      workspacesApi.cancelInvitation(workspaceId, invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['workspace', workspaceId, 'invitations'],
      });
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] });
    },
  });
};
