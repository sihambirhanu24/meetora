'use client';

import { type Conversation } from '@/features/messages/types';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  isLoading?: boolean;
}

export function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
  isLoading,
}: ConversationListProps) {
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB] mx-auto mb-3"></div>
          <p className="text-sm text-slate-500">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-base font-medium text-[#14213D] mb-2">No conversations yet</h3>
          <p className="text-sm text-slate-500">
            Start a conversation with your teammates to collaborate
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="divide-y divide-slate-100">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => onSelectConversation(conversation.id)}
            className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors text-left ${
              activeConversationId === conversation.id ? 'bg-blue-50' : ''
            }`}
          >
            {/* Avatar */}
            <div className="flex-shrink-0 mt-1">
              {conversation.displayImage ? (
                <img
                  src={conversation.displayImage}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium text-sm">
                  {conversation.displayName.charAt(0).toUpperCase()}
                </div>
              )}
              {conversation.type === 'channel' && (
                <div className="absolute ml-7 -mt-2">
                  <div className="w-4 h-4 bg-slate-600 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between mb-1">
                <h4 className={`text-sm font-medium truncate ${
                  activeConversationId === conversation.id ? 'text-[#2563EB]' : 'text-[#14213D]'
                }`}>
                  {conversation.displayName}
                </h4>
                {conversation.lastMessageAt && (
                  <span className="text-xs text-slate-500 ml-2 flex-shrink-0">
                    {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })}
                  </span>
                )}
              </div>
              
              {conversation.lastMessage ? (
                <p className="text-sm text-slate-600 truncate">
                  {conversation.lastMessage.sender.firstName}: {conversation.lastMessage.content}
                </p>
              ) : (
                <p className="text-sm text-slate-400 italic">No messages yet</p>
              )}

              {/* Indicators */}
              <div className="flex items-center gap-2 mt-1">
                {conversation.unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-[#2563EB] text-white text-xs font-medium rounded-full">
                    {conversation.unreadCount}
                  </span>
                )}
                {conversation.type === 'channel' && (
                  <span className="text-xs text-slate-500">
                    #{conversation.name}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
