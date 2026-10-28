'use client';

import { type Conversation } from '@/features/messages/types';

interface ConversationHeaderProps {
  conversation: Conversation | null;
  onBack?: () => void;
}

export function ConversationHeader({ conversation, onBack }: ConversationHeaderProps) {
  if (!conversation) {
    return (
      <div className="h-16 border-b border-slate-200 bg-white px-4 flex items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100"></div>
          <div>
            <div className="h-4 w-32 bg-slate-100 rounded mb-1"></div>
            <div className="h-3 w-24 bg-slate-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-16 border-b border-slate-200 bg-white px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Back button for mobile */}
        {onBack && (
          <button
            onClick={onBack}
            className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Avatar */}
        <div className="flex-shrink-0">
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
        </div>

        {/* Info */}
        <div>
          <h2 className="text-sm font-semibold text-[#14213D]">
            {conversation.displayName}
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {conversation.type === 'channel' && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                Channel
              </span>
            )}
            {conversation.type === 'direct' && <span>Direct Message</span>}
            {conversation.type === 'group' && (
              <span>{conversation.participants.length} members</span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        <button className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
