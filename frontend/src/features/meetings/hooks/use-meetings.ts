import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { meetingsApi } from '../api/meetings-api';
import type { CreateMeetingData, UpdateMeetingData, UpdateParticipantStatusData } from '../types';

export const MEETINGS_QUERY_KEYS = {
  all: ['meetings'] as const,
  upcoming: ['meetings', 'upcoming'] as const,
  pendingInvites: ['meetings', 'pending-invites'] as const,
  previous: ['meetings', 'previous'] as const,
  todayCount: ['meetings', 'today-count'] as const,
  detail: (id: string) => ['meetings', id] as const,
};

export function useMeetings(params?: { status?: string; type?: string }) {
  return useQuery({
    queryKey: [...MEETINGS_QUERY_KEYS.all, params],
    queryFn: () => meetingsApi.getAllMeetings(params),
  });
}

export function useUpcomingMeetings() {
  return useQuery({
    queryKey: MEETINGS_QUERY_KEYS.upcoming,
    queryFn: () => meetingsApi.getUpcomingMeetings(),
  });
}

export function usePendingInvites() {
  return useQuery({
    queryKey: MEETINGS_QUERY_KEYS.pendingInvites,
    queryFn: () => meetingsApi.getPendingInvites(),
  });
}

export function usePreviousMeetings() {
  return useQuery({
    queryKey: MEETINGS_QUERY_KEYS.previous,
    queryFn: () => meetingsApi.getPreviousMeetings(),
  });
}

export function useTodayCount() {
  return useQuery({
    queryKey: MEETINGS_QUERY_KEYS.todayCount,
    queryFn: () => meetingsApi.getTodayCount(),
  });
}

export function useMeeting(id: string) {
  return useQuery({
    queryKey: MEETINGS_QUERY_KEYS.detail(id),
    queryFn: () => meetingsApi.getMeeting(id),
    enabled: !!id,
  });
}

export function useCreateMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMeetingData) => meetingsApi.createMeeting(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEETINGS_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: MEETINGS_QUERY_KEYS.upcoming });
      queryClient.invalidateQueries({ queryKey: MEETINGS_QUERY_KEYS.todayCount });
    },
  });
}

export function useUpdateMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMeetingData }) =>
      meetingsApi.updateMeeting(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: MEETINGS_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: MEETINGS_QUERY_KEYS.upcoming });
      queryClient.invalidateQueries({ queryKey: MEETINGS_QUERY_KEYS.detail(variables.id) });
    },
  });
}

export function useCancelMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => meetingsApi.cancelMeeting(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: MEETINGS_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: MEETINGS_QUERY_KEYS.upcoming });
      queryClient.invalidateQueries({ queryKey: MEETINGS_QUERY_KEYS.detail(id) });
    },
  });
}

export function useUpdateParticipantStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateParticipantStatusData }) =>
      meetingsApi.updateParticipantStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: MEETINGS_QUERY_KEYS.pendingInvites });
      queryClient.invalidateQueries({ queryKey: MEETINGS_QUERY_KEYS.upcoming });
      queryClient.invalidateQueries({ queryKey: MEETINGS_QUERY_KEYS.detail(variables.id) });
    },
  });
}
