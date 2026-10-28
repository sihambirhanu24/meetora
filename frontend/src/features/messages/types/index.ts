export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  jobTitle?: string;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group' | 'channel';
  workspaceId?: string;
  name?: string;
  description?: string;
  isPrivate: boolean;
  createdById: string;
  createdBy: User;
  participants: ConversationParticipant[];
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
  displayName: string;
  displayImage?: string;
  unreadCount: number;
  myRole?: string;
  lastMessage?: Message;
  _count?: {
    messages: number;
  };
}

export interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId: string;
  user: User;
  role: string;
  lastReadAt?: string;
  isMuted: boolean;
  isPinned: boolean;
  joinedAt: string;
  leftAt?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: User;
  content: string;
  type: 'text' | 'file' | 'image' | 'system';
  parentMessageId?: string;
  parentMessage?: Message;
  metadata?: any;
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    replies: number;
  };
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

export interface UpdateParticipantSettingsData {
  isMuted?: boolean;
  isPinned?: boolean;
}

export interface AddParticipantsData {
  userIds: string[];
}
