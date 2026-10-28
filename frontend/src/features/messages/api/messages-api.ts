import axios from '@/lib/api/axios';
import type {
  Conversation,
  Message,
  CreateConversationData,
  UpdateConversationData,
  SendMessageData,
  UpdateParticipantSettingsData,
  AddParticipantsData,
} from '../types';

export const messagesApi = {
  // Conversation endpoints
  getAllConversations: async (workspaceId?: string): Promise<Conversation[]> => {
    const params = workspaceId ? { workspaceId } : undefined;
    const { data } = await axios.get('/messages/conversations', { params });
    return data;
  },

  getConversation: async (id: string): Promise<Conversation> => {
    const { data } = await axios.get(`/messages/conversations/${id}`);
    return data;
  },

  createConversation: async (conversationData: CreateConversationData): Promise<Conversation> => {
    const { data } = await axios.post('/messages/conversations', conversationData);
    return data;
  },

  updateConversation: async (
    id: string,
    conversationData: UpdateConversationData
  ): Promise<Conversation> => {
    const { data } = await axios.patch(`/messages/conversations/${id}`, conversationData);
    return data;
  },

  addParticipants: async (
    id: string,
    participantsData: AddParticipantsData
  ): Promise<Conversation> => {
    const { data } = await axios.post(`/messages/conversations/${id}/participants`, participantsData);
    return data;
  },

  updateParticipantSettings: async (
    id: string,
    settingsData: UpdateParticipantSettingsData
  ): Promise<{ message: string }> => {
    const { data } = await axios.patch(`/messages/conversations/${id}/settings`, settingsData);
    return data;
  },

  leaveConversation: async (id: string): Promise<{ message: string }> => {
    const { data } = await axios.post(`/messages/conversations/${id}/leave`);
    return data;
  },

  // Message endpoints
  getMessages: async (
    conversationId: string,
    limit?: number,
    before?: string
  ): Promise<Message[]> => {
    const params: any = {};
    if (limit) params.limit = limit;
    if (before) params.before = before;
    const { data } = await axios.get(`/messages/conversations/${conversationId}/messages`, {
      params,
    });
    return data;
  },

  sendMessage: async (
    conversationId: string,
    messageData: SendMessageData
  ): Promise<Message> => {
    const { data } = await axios.post(
      `/messages/conversations/${conversationId}/messages`,
      messageData
    );
    return data;
  },

  updateMessage: async (id: string, content: string): Promise<Message> => {
    const { data } = await axios.patch(`/messages/messages/${id}`, { content });
    return data;
  },

  deleteMessage: async (id: string): Promise<{ message: string }> => {
    const { data } = await axios.delete(`/messages/messages/${id}`);
    return data;
  },
};
