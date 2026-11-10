import axios from 'axios';
import {
  Conversation,
  Message,
  CreateConversationData,
  SendMessageData,
  UpdateConversationData,
  UpdateParticipantData,
  AddParticipantsData,
  ConversationParticipant,
} from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create axios instance with credentials
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// ==================== CONVERSATIONS ====================

export const createConversation = async (
  data: CreateConversationData
): Promise<Conversation> => {
  const response = await api.post('/messages/conversations', data);
  return response.data;
};

export const getUserConversations = async (
  workspaceId?: string
): Promise<Conversation[]> => {
  const response = await api.get('/messages/conversations', {
    params: { workspaceId },
  });
  return response.data;
};

export const getConversation = async (
  conversationId: string
): Promise<Conversation> => {
  const response = await api.get(`/messages/conversations/${conversationId}`);
  return response.data;
};

export const updateConversation = async (
  conversationId: string,
  data: UpdateConversationData
): Promise<Conversation> => {
  const response = await api.put(
    `/messages/conversations/${conversationId}`,
    data
  );
  return response.data;
};

export const deleteConversation = async (
  conversationId: string
): Promise<{ message: string }> => {
  const response = await api.delete(`/messages/conversations/${conversationId}`);
  return response.data;
};

// ==================== PARTICIPANTS ====================

export const addParticipants = async (
  conversationId: string,
  data: AddParticipantsData
): Promise<ConversationParticipant[]> => {
  const response = await api.post(
    `/messages/conversations/${conversationId}/participants`,
    data
  );
  return response.data;
};

export const removeParticipant = async (
  conversationId: string,
  userId: string
): Promise<{ message: string }> => {
  const response = await api.delete(
    `/messages/conversations/${conversationId}/participants/${userId}`
  );
  return response.data;
};

export const updateParticipant = async (
  conversationId: string,
  userId: string,
  data: UpdateParticipantData
): Promise<ConversationParticipant> => {
  const response = await api.put(
    `/messages/conversations/${conversationId}/participants/${userId}`,
    data
  );
  return response.data;
};

// ==================== MESSAGES ====================

export const sendMessage = async (
  conversationId: string,
  data: SendMessageData
): Promise<Message> => {
  const response = await api.post(
    `/messages/conversations/${conversationId}/messages`,
    data
  );
  return response.data;
};

export const getMessages = async (
  conversationId: string,
  limit?: number,
  before?: string
): Promise<Message[]> => {
  const response = await api.get(
    `/messages/conversations/${conversationId}/messages`,
    {
      params: { limit, before },
    }
  );
  return response.data;
};

export const deleteMessage = async (
  messageId: string
): Promise<{ message: string }> => {
  const response = await api.delete(`/messages/messages/${messageId}`);
  return response.data;
};

export const markAsRead = async (
  conversationId: string
): Promise<{ message: string }> => {
  const response = await api.post(
    `/messages/conversations/${conversationId}/read`
  );
  return response.data;
};
