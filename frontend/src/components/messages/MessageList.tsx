'use client';

import { useEffect, useRef } from 'react';
import { type Message } from '@/features/messages/types';
import { format, isToday, isYesterday } from 'date-fns';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  isLoading?: boolean;
}

export function MessageList({ messages, currentUserId, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB] mx-auto mb-3"></div>
          <p className="text-sm text-slate-500">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h3 className="text-base font-medium text-[#14213D] mb-2">No messages yet</h3>
          <p className="text-sm text-slate-500">
            Send a message to start the conversation
          </p>
        </div>
      </div>
    );
  }

  const formatMessageTime = (date: string) => {
    const messageDate = new Date(date);
    if (isToday(messageDate)) {
      return format(messageDate, 'h:mm a');
    } else if (isYesterday(messageDate)) {
      return `Yesterday at ${format(messageDate, 'h:mm a')}`;
    } else {
      return format(messageDate, 'MMM d, h:mm a');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
      {messages.map((message, index) => {
        const isOwnMessage = message.senderId === currentUserId;
        const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;
        const isConsecutive = index > 0 && messages[index - 1].senderId === message.senderId;

        return (
          <div
            key={message.id}
            className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} ${
              isConsecutive ? 'mt-1' : 'mt-4'
            }`}
          >
            {/* Avatar */}
            <div className="flex-shrink-0">
              {showAvatar ? (
                message.sender.profileImage ? (
                  <img
                    src={message.sender.profileImage}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium text-xs">
                    {message.sender.firstName.charAt(0)}
                    {message.sender.lastName.charAt(0)}
                  </div>
                )
              ) : (
                <div className="w-8 h-8" />
              )}
            </div>

            {/* Message Content */}
            <div className={`flex-1 max-w-lg ${isOwnMessage ? 'text-right' : 'text-left'}`}>
              {showAvatar && !isOwnMessage && (
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-sm font-medium text-[#14213D]">
                    {message.sender.firstName} {message.sender.lastName}
                  </span>
                  <span className="text-xs text-slate-500">
                    {formatMessageTime(message.createdAt)}
                  </span>
                </div>
              )}

              <div
                className={`inline-block px-4 py-2 rounded-2xl ${
                  isOwnMessage
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-slate-100 text-[#14213D]'
                }`}
              >
                {message.parentMessage && (
                  <div className={`text-xs mb-2 pb-2 border-b ${
                    isOwnMessage ? 'border-blue-400' : 'border-slate-200'
                  }`}>
                    <div className="opacity-75">
                      Replying to {message.parentMessage.sender.firstName}
                    </div>
                    <div className="opacity-60 truncate">
                      {message.parentMessage.content}
                    </div>
                  </div>
                )}
                
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </p>

                {message.isEdited && (
                  <span className={`text-xs ml-2 ${
                    isOwnMessage ? 'text-blue-200' : 'text-slate-500'
                  }`}>
                    (edited)
                  </span>
                )}
              </div>

              {showAvatar && isOwnMessage && (
                <div className="text-xs text-slate-500 mt-1">
                  {formatMessageTime(message.createdAt)}
                </div>
              )}
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
