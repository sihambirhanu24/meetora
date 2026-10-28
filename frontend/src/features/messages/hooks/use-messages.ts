import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagesApi } from '../api/messages-api';
import type {
  CreateConversationData,
  UpdateConversationData,
  SendMessageData,
  UpdateParticipantSettingsData,
  AddParticipantsData,
} from '../types';

export const MESSAGES_QUERY_KEYS = {
  conversations: ['conversations'] as const,
  conversationsByWorkspace: (workspaceId?: string) =>
    ['conversations', workspaceId] as const,
  conversationDetail: (id: string) => ['conversations', id] as const,
  messages: (conversationId: string) => ['messages', conversationId] as const,
};

// Conversation hooks
export function useConversations(workspaceId?: string) {
  return useQuery({
    queryKey: MESSAGES_QUERY_KEYS.conversationsByWorkspace(workspaceId),
    queryFn: () => messagesApi.getAllConversations(workspaceId),
  });
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: MESSAGES_QUERY_KEYS.conversationDetail(id),
    queryFn: () => messagesApi.getConversation(id),
    enabled: !!id,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateConversationData) =>
      messagesApi.createConversation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MESSAGES_QUERY_KEYS.conversations });
    },
  });
}

export function useUpdateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateConversationData }) =>
      messagesApi.updateConversation(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: MESSAGES_QUERY_KEYS.conversations });
      queryClient.invalidateQueries({
        queryKey: MESSAGES_QUERY_KEYS.conversationDetail(variables.id),
      });
    },
  });
}

export function useAddParticipants() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddParticipantsData }) =>
      messagesApi.addParticipants(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: MESSAGES_QUERY_KEYS.conversationDetail(variables.id),
      });
    },
  });
}

export function useUpdateParticipantSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateParticipantSettingsData }) =>
      messagesApi.updateParticipantSettings(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: MESSAGES_QUERY_KEYS.conversations });
      queryClient.invalidateQueries({
        queryKey: MESSAGES_QUERY_KEYS.conversationDetail(variables.id),
      });
    },
  });
}

export function useLeaveConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => messagesApi.leaveConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MESSAGES_QUERY_KEYS.conversations });
    },
  });
}

// Message hooks
export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: MESSAGES_QUERY_KEYS.messages(conversationId),
    queryFn: () => messagesApi.getMessages(conversationId),
    enabled: !!conversationId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, data }: { conversationId: string; data: SendMessageData }) =>
      messagesApi.sendMessage(conversationId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: MESSAGES_QUERY_KEYS.messages(variables.conversationId),
      });
      queryClient.invalidateQueries({ queryKey: MESSAGES_QUERY_KEYS.conversations });
    },
  });
}

export function useUpdateMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      messagesApi.updateMessage(id, content),
    onSuccess: (message) => {
      queryClient.invalidateQueries({
        queryKey: MESSAGES_QUERY_KEYS.messages(message.conversationId),
      });
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, conversationId }: { id: string; conversationId: string }) =>
      messagesApi.deleteMessage(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: MESSAGES_QUERY_KEYS.messages(variables.conversationId),
      });
      queryClient.invalidateQueries({ queryKey: MESSAGES_QUERY_KEYS.conversations });
    },
  });
}
