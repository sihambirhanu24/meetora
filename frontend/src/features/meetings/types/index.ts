export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
}

export interface MeetingParticipant {
  id: string;
  meetingId: string;
  userId: string;
  user: User;
  status: 'invited' | 'accepted' | 'declined' | 'tentative';
  role: 'participant' | 'co-host';
  joinedAt?: string;
  leftAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  timezone: string;
  meetingLink?: string;
  meetingType: 'scheduled' | 'instant' | 'recurring';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  hostId: string;
  host: User;
  participants: MeetingParticipant[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMeetingData {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  timezone?: string;
  meetingLink?: string;
  meetingType?: 'scheduled' | 'instant' | 'recurring';
  participantEmails?: string[];
}

export interface UpdateMeetingData {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  timezone?: string;
  meetingLink?: string;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export interface UpdateParticipantStatusData {
  status: 'accepted' | 'declined' | 'tentative';
}

export interface PendingInvite {
  id: string;
  meetingId: string;
  userId: string;
  user: User;
  status: string;
  meeting: Meeting;
  createdAt: string;
  updatedAt: string;
}

export interface TodayCountResponse {
  count: number;
}
