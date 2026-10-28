import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workspacesApi } from '../api/workspaces-api';

export const WORKSPACES_QUERY_KEYS = {
  all: ['workspaces'] as const,
  detail: (id: string) => ['workspaces', id] as const,
  members: (id: string) => ['workspaces', id, 'members'] as const,
};

export function useWorkspaces() {
  return useQuery({
    queryKey: WORKSPACES_QUERY_KEYS.all,
    queryFn: () => workspacesApi.getAllWorkspaces(),
  });
}

export function useWorkspace(id: string) {
  return useQuery({
    queryKey: WORKSPACES_QUERY_KEYS.detail(id),
    queryFn: () => workspacesApi.getWorkspace(id),
    enabled: !!id,
  });
}

export function useWorkspaceMembers(id: string) {
  return useQuery({
    queryKey: WORKSPACES_QUERY_KEYS.members(id),
    queryFn: () => workspacesApi.getWorkspaceMembers(id),
    enabled: !!id,
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: workspacesApi.createWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKSPACES_QUERY_KEYS.all });
    },
  });
}

export function useUpdateWorkspace() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      workspacesApi.updateWorkspace(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: WORKSPACES_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: WORKSPACES_QUERY_KEYS.detail(variables.id) });
    },
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => workspacesApi.deleteWorkspace(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKSPACES_QUERY_KEYS.all });
    },
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ workspaceId, data }: { workspaceId: string; data: any }) =>
      workspacesApi.inviteMember(workspaceId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: WORKSPACES_QUERY_KEYS.detail(variables.workspaceId) 
      });
    },
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ workspaceId, memberId, role }: { workspaceId: string; memberId: string; role: string }) =>
      workspacesApi.updateMemberRole(workspaceId, memberId, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: WORKSPACES_QUERY_KEYS.members(variables.workspaceId) 
      });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ workspaceId, memberId }: { workspaceId: string; memberId: string }) =>
      workspacesApi.removeMember(workspaceId, memberId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: WORKSPACES_QUERY_KEYS.members(variables.workspaceId) 
      });
    },
  });
}
