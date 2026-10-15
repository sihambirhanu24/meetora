import axios from '@/lib/api/axios';
import type {
  Meeting,
  CreateMeetingData,
  UpdateMeetingData,
  UpdateParticipantStatusData,
  PendingInvite,
  TodayCountResponse,
} from '../types';

export const meetingsApi = {
  // Get all meetings
  getAllMeetings: async (params?: { status?: string; type?: string }): Promise<Meeting[]> => {
    const { data } = await axios.get('/meetings', { params });
    return data;
  },

  // Get upcoming meetings
  getUpcomingMeetings: async (): Promise<Meeting[]> => {
    const { data } = await axios.get('/meetings/upcoming');
    return data;
  },

  // Get pending invites
  getPendingInvites: async (): Promise<PendingInvite[]> => {
    const { data } = await axios.get('/meetings/pending-invites');
    return data;
  },

  // Get previous meetings
  getPreviousMeetings: async (): Promise<Meeting[]> => {
    const { data } = await axios.get('/meetings/previous');
    return data;
  },

  // Get today's meeting count
  getTodayCount: async (): Promise<TodayCountResponse> => {
    const { data } = await axios.get('/meetings/today-count');
    return data;
  },

  // Get single meeting
  getMeeting: async (id: string): Promise<Meeting> => {
    const { data } = await axios.get(`/meetings/${id}`);
    return data;
  },

  // Create meeting
  createMeeting: async (meetingData: CreateMeetingData): Promise<Meeting> => {
    const { data } = await axios.post('/meetings', meetingData);
    return data;
  },

  // Update meeting
  updateMeeting: async (id: string, meetingData: UpdateMeetingData): Promise<Meeting> => {
    const { data } = await axios.patch(`/meetings/${id}`, meetingData);
    return data;
  },

  // Cancel meeting
  cancelMeeting: async (id: string): Promise<Meeting> => {
    const { data } = await axios.patch(`/meetings/${id}/cancel`);
    return data;
  },

  // Update participant status (accept/decline invite)
  updateParticipantStatus: async (
    id: string,
    statusData: UpdateParticipantStatusData
  ): Promise<any> => {
    const { data } = await axios.patch(`/meetings/${id}/status`, statusData);
    return data;
  },
};
