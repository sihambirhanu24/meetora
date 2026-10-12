import apiClient from '@/lib/api/axios';
import { User, UpdateProfileRequest } from '../types';

export const profileApi = {
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const response = await apiClient.patch('/users/me', data);
    return response.data;
  },
};
