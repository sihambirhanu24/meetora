export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  jobTitle?: string;
}

export interface Meeting {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  host: User;
}

export interface Recording {
  id: string;
  meetingId: string;
  meeting: Meeting;
  title: string;
  description?: string;
  duration?: number; // Duration in seconds
  fileSize?: bigint; // File size in bytes
  format?: string; // e.g., "mp4", "webm"
  recordedAt: string;
  status: 'processing' | 'available' | 'failed' | 'deleted';
  hostId: string;
  workspaceId?: string;
  isPublic: boolean;
  shareToken?: string;
  thumbnailUrl?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  // Added by backend to indicate limitations
  playbackAvailable: boolean;
  limitations: string;
}

export interface CreateRecordingData {
  meetingId: string;
  title: string;
  description?: string;
  duration?: number;
  format?: string;
  workspaceId?: string;
  isPublic?: boolean;
}

export interface UpdateRecordingData {
  title?: string;
  description?: string;
  isPublic?: boolean;
}

export interface RecordingFilters {
  status?: string;
  workspaceId?: string;
  hostId?: string;
  startDate?: string;
  endDate?: string;
}

export interface ShareTokenResponse {
  shareToken: string;
  shareUrl: string;
}
