import apiClient from '@/lib/api/axios';
import { Notification } from '../types';

export const notificationsApi = {
  getAll: async (unreadOnly = false): Promise<Notification[]> => {
    const response = await apiClient.get('/notifications', {
      params: { unreadOnly },
    });
    return response.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data.count;
  },

  markAsRead: async (notificationIds: string[]): Promise<void> => {
    await apiClient.post('/notifications/mark-read', { notificationIds });
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.post('/notifications/mark-all-read');
  },

  deleteNotification: async (id: string): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`);
  },

  deleteAllRead: async (): Promise<void> => {
    await apiClient.delete('/notifications/read/all');
  },
};
