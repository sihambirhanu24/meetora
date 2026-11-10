'use client';

import { Search, Plus, Hash, MessageCircle, Users } from 'lucide-react';
import { Conversation } from '@/features/messages/types';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewConversation: () => void;
  isLoading: boolean;
}

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  searchQuery,
  onSearchChange,
  onNewConversation,
  isLoading,
}: ConversationListProps) {
  const getConversationName = (conversation: Conversation): string => {
    if (conversation.name) return conversation.name;

    // For direct messages, show the other participant's name
    if (conversation.type === 'direct') {
      const otherParticipant = conversation.participants.find(
        (p) => p.userId !== conversation.createdById
      );
      if (otherParticipant) {
        return `${otherParticipant.user.firstName} ${otherParticipant.user.lastName}`;
      }
    }

    // For group messages, show participant names
    const participantNames = conversation.participants
      .slice(0, 3)
      .map((p) => p.user.firstName)
      .join(', ');
    return participantNames || 'Unnamed Conversation';
  };

  const getConversationAvatar = (conversation: Conversation) => {
    if (conversation.type === 'channel') {
      return (
        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
          <Hash className="w-5 h-5 text-indigo-600" />
        </div>
      );
    }

    if (conversation.type === 'group') {
      return (
        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
          <Users className="w-5 h-5 text-purple-600" />
        </div>
      );
    }

    // Direct message - show participant avatar
    const otherParticipant = conversation.participants.find(
      (p) => p.userId !== conversation.createdById
    );

    if (otherParticipant?.user.profileImage) {
      return (
        <img
          src={otherParticipant.user.profileImage}
          alt={getConversationName(conversation)}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
      );
    }

    const initials = otherParticipant
      ? `${otherParticipant.user.firstName[0]}${otherParticipant.user.lastName[0]}`
      : '?';

    return (
      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-medium text-blue-700">{initials}</span>
      </div>
    );
  };

  const getLastMessagePreview = (conversation: Conversation): string => {
    if (!conversation.messages || conversation.messages.length === 0) {
      return 'No messages yet';
    }

    const lastMessage = conversation.messages[0];
    if (lastMessage.isDeleted) return 'Message deleted';
    if (lastMessage.type === 'file') return '📎 File attachment';
    if (lastMessage.type === 'image') return '🖼️ Image';
    return lastMessage.content;
  };

  const getLastMessageTime = (conversation: Conversation): string => {
    const timestamp = conversation.lastMessageAt || conversation.createdAt;
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  return (
    <>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
          <button
            onClick={onNewConversation}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="New conversation"
          >
            <Plus className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {searchQuery
                ? 'Try adjusting your search'
                : 'Start a conversation to get started'}
            </p>
            {!searchQuery && (
              <button
                onClick={onNewConversation}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                New Conversation
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={`w-full p-4 flex items-start space-x-3 hover:bg-gray-50 transition-colors text-left ${
                  selectedConversationId === conversation.id
                    ? 'bg-blue-50 hover:bg-blue-50'
                    : ''
                }`}
              >
                {/* Avatar */}
                <div className="relative">
                  {getConversationAvatar(conversation)}
                  {conversation.currentUserParticipant?.isPinned && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <h3
                        className={`text-sm font-medium truncate ${
                          conversation.unreadCount && conversation.unreadCount > 0
                            ? 'text-gray-900'
                            : 'text-gray-700'
                        }`}
                      >
                        {getConversationName(conversation)}
                      </h3>
                      {conversation.isPrivate && (
                        <span className="text-xs text-gray-400">🔒</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                      {getLastMessageTime(conversation)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p
                      className={`text-sm truncate ${
                        conversation.unreadCount && conversation.unreadCount > 0
                          ? 'text-gray-900 font-medium'
                          : 'text-gray-500'
                      }`}
                    >
                      {conversation.currentUserParticipant?.isMuted && '🔕 '}
                      {getLastMessagePreview(conversation)}
                    </p>
                    {conversation.unreadCount && conversation.unreadCount > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded-full flex-shrink-0">
                        {conversation.unreadCount > 99
                          ? '99+'
                          : conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
