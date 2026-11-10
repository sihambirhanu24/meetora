import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as messagesApi from '../api/messages-api';
import {
  CreateConversationData,
  SendMessageData,
  UpdateConversationData,
  UpdateParticipantData,
  AddParticipantsData,
} from '../types';

// Query keys
export const messagesKeys = {
  all: ['messages'] as const,
  conversations: () => [...messagesKeys.all, 'conversations'] as const,
  conversation: (id: string) =>
    [...messagesKeys.conversations(), id] as const,
  conversationMessages: (id: string) =>
    [...messagesKeys.conversation(id), 'messages'] as const,
  workspaceConversations: (workspaceId: string) =>
    [...messagesKeys.conversations(), 'workspace', workspaceId] as const,
};

// ==================== CONVERSATIONS ====================

export const useConversations = (workspaceId?: string) => {
  return useQuery({
    queryKey: workspaceId
      ? messagesKeys.workspaceConversations(workspaceId)
      : messagesKeys.conversations(),
    queryFn: () => messagesApi.getUserConversations(workspaceId),
  });
};

export const useConversation = (conversationId: string) => {
  return useQuery({
    queryKey: messagesKeys.conversation(conversationId),
    queryFn: () => messagesApi.getConversation(conversationId),
    enabled: !!conversationId,
  });
};

export const useCreateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateConversationData) =>
      messagesApi.createConversation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messagesKeys.conversations() });
    },
  });
};

export const useUpdateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      data,
    }: {
      conversationId: string;
      data: UpdateConversationData;
    }) => messagesApi.updateConversation(conversationId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: messagesKeys.conversation(variables.conversationId),
      });
      queryClient.invalidateQueries({ queryKey: messagesKeys.conversations() });
    },
  });
};

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      messagesApi.deleteConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messagesKeys.conversations() });
    },
  });
};

// ==================== PARTICIPANTS ====================

export const useAddParticipants = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      data,
    }: {
      conversationId: string;
      data: AddParticipantsData;
    }) => messagesApi.addParticipants(conversationId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: messagesKeys.conversation(variables.conversationId),
      });
    },
  });
};

export const useRemoveParticipant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      userId,
    }: {
      conversationId: string;
      userId: string;
    }) => messagesApi.removeParticipant(conversationId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: messagesKeys.conversation(variables.conversationId),
      });
    },
  });
};

export const useUpdateParticipant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      userId,
      data,
    }: {
      conversationId: string;
      userId: string;
      data: UpdateParticipantData;
    }) => messagesApi.updateParticipant(conversationId, userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: messagesKeys.conversation(variables.conversationId),
      });
      queryClient.invalidateQueries({ queryKey: messagesKeys.conversations() });
    },
  });
};

// ==================== MESSAGES ====================

export const useMessages = (conversationId: string, limit?: number) => {
  return useQuery({
    queryKey: messagesKeys.conversationMessages(conversationId),
    queryFn: () => messagesApi.getMessages(conversationId, limit),
    enabled: !!conversationId,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      data,
    }: {
      conversationId: string;
      data: SendMessageData;
    }) => messagesApi.sendMessage(conversationId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: messagesKeys.conversationMessages(variables.conversationId),
      });
      queryClient.invalidateQueries({ queryKey: messagesKeys.conversations() });
    },
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => messagesApi.deleteMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messagesKeys.all });
    },
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      messagesApi.markAsRead(conversationId),
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({
        queryKey: messagesKeys.conversation(conversationId),
      });
      queryClient.invalidateQueries({ queryKey: messagesKeys.conversations() });
    },
  });
};
