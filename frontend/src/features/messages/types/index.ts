export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
  jobTitle?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: User;
  content: string;
  type: 'text' | 'file' | 'image' | 'system';
  parentMessageId?: string;
  parentMessage?: {
    id: string;
    content: string;
    sender: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
  metadata?: any;
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId: string;
  user: User;
  role: 'admin' | 'member';
  lastReadAt?: string;
  isMuted: boolean;
  isPinned: boolean;
  joinedAt: string;
  leftAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group' | 'channel';
  workspaceId?: string;
  name?: string;
  description?: string;
  isPrivate: boolean;
  createdById: string;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  participants: ConversationParticipant[];
  messages?: Message[];
  lastMessageAt?: string;
  unreadCount?: number;
  currentUserParticipant?: ConversationParticipant;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConversationData {
  type: 'direct' | 'group' | 'channel';
  workspaceId?: string;
  name?: string;
  description?: string;
  isPrivate?: boolean;
  participantIds: string[];
}

export interface UpdateConversationData {
  name?: string;
  description?: string;
  isPrivate?: boolean;
}

export interface SendMessageData {
  content: string;
  type?: 'text' | 'file' | 'image' | 'system';
  parentMessageId?: string;
  metadata?: any;
}

export interface UpdateParticipantData {
  role?: 'admin' | 'member';
  isMuted?: boolean;
  isPinned?: boolean;
  lastReadAt?: string;
}

export interface AddParticipantsData {
  userIds: string[];
}
