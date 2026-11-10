'use client';

import { Message } from '@/features/messages/types';
import { format } from 'date-fns';
import { Reply, MoreVertical } from 'lucide-react';
import { useState } from 'react';

interface MessageItemProps {
  message: Message;
  showSender: boolean;
}

export function MessageItem({ message, showSender }: MessageItemProps) {
  const [showActions, setShowActions] = useState(false);

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'h:mm a');
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const getInitials = () => {
    return `${message.sender.firstName[0]}${message.sender.lastName[0]}`;
  };

  return (
    <div
      className="group relative"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        {showSender && (
          <div className="flex-shrink-0">
            {message.sender.profileImage ? (
              <img
                src={message.sender.profileImage}
                alt={`${message.sender.firstName} ${message.sender.lastName}`}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-xs font-medium text-blue-700">
                  {getInitials()}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Message Content */}
        <div className={`flex-1 min-w-0 ${!showSender ? 'ml-11' : ''}`}>
          {/* Sender Info */}
          {showSender && (
            <div className="flex items-baseline space-x-2 mb-1">
              <span className="text-sm font-semibold text-gray-900">
                {message.sender.firstName} {message.sender.lastName}
              </span>
              <span className="text-xs text-gray-500">
                {formatTime(message.createdAt)}
              </span>
            </div>
          )}

          {/* Parent Message (if replying) */}
          {message.parentMessage && (
            <div className="mb-2 pl-3 border-l-2 border-gray-300 py-1">
              <div className="flex items-center space-x-1 text-xs text-gray-500 mb-0.5">
                <Reply className="w-3 h-3" />
                <span className="font-medium">
                  {message.parentMessage.sender.firstName}{' '}
                  {message.parentMessage.sender.lastName}
                </span>
              </div>
              <p className="text-xs text-gray-600 truncate">
                {message.parentMessage.content}
              </p>
            </div>
          )}

          {/* Message Text */}
          <div className="text-sm text-gray-800 break-words whitespace-pre-wrap">
            {message.isDeleted ? (
              <span className="italic text-gray-400">Message deleted</span>
            ) : (
              message.content
            )}
          </div>

          {/* Edited indicator */}
          {message.isEdited && !message.isDeleted && (
            <span className="text-xs text-gray-400 ml-1">(edited)</span>
          )}
        </div>

        {/* Message Actions */}
        {showActions && !message.isDeleted && (
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Reply (Coming soon)"
              disabled
            >
              <Reply className="w-4 h-4 text-gray-500" />
            </button>
            <button
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="More actions"
              disabled
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
