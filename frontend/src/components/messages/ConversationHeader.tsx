'use client';

import { ArrowLeft, Hash, Users, MoreVertical, Info, Video, Phone } from 'lucide-react';
import { Conversation } from '@/features/messages/types';

interface ConversationHeaderProps {
  conversation: Conversation;
  onBack: () => void;
}

export function ConversationHeader({
  conversation,
  onBack,
}: ConversationHeaderProps) {
  const getConversationName = (): string => {
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
      .map((p) => `${p.user.firstName} ${p.user.lastName}`)
      .join(', ');
    return participantNames || 'Unnamed Conversation';
  };

  const getConversationInfo = (): string => {
    if (conversation.type === 'channel') {
      const count = conversation.participants.length;
      return `${count} ${count === 1 ? 'member' : 'members'}`;
    }

    if (conversation.type === 'direct') {
      const otherParticipant = conversation.participants.find(
        (p) => p.userId !== conversation.createdById
      );
      return otherParticipant?.user.jobTitle || otherParticipant?.user.email || '';
    }

    const count = conversation.participants.length;
    return `${count} ${count === 1 ? 'member' : 'members'}`;
  };

  const getConversationIcon = () => {
    if (conversation.type === 'channel') {
      return <Hash className="w-5 h-5 text-gray-600" />;
    }
    if (conversation.type === 'group') {
      return <Users className="w-5 h-5 text-gray-600" />;
    }
    return null;
  };

  const getConversationAvatar = () => {
    if (conversation.type !== 'direct') return null;

    const otherParticipant = conversation.participants.find(
      (p) => p.userId !== conversation.createdById
    );

    if (otherParticipant?.user.profileImage) {
      return (
        <img
          src={otherParticipant.user.profileImage}
          alt={getConversationName()}
          className="w-8 h-8 rounded-full object-cover"
        />
      );
    }

    const initials = otherParticipant
      ? `${otherParticipant.user.firstName[0]}${otherParticipant.user.lastName[0]}`
      : '?';

    return (
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
        <span className="text-sm font-medium text-blue-700">{initials}</span>
      </div>
    );
  };

  return (
    <div className="border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {/* Back button (mobile) */}
          <button
            onClick={onBack}
            className="md:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>

          {/* Avatar/Icon */}
          <div className="flex-shrink-0">
            {conversation.type === 'direct' ? (
              getConversationAvatar()
            ) : (
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  conversation.type === 'channel'
                    ? 'bg-indigo-100'
                    : 'bg-purple-100'
                }`}
              >
                {getConversationIcon()}
              </div>
            )}
          </div>

          {/* Conversation Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-semibold text-gray-900 truncate">
                {getConversationName()}
              </h2>
              {conversation.isPrivate && (
                <span className="text-xs text-gray-400">🔒</span>
              )}
            </div>
            <p className="text-xs text-gray-500 truncate">
              {getConversationInfo()}
            </p>
          </div>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center space-x-1 ml-4">
          {conversation.type === 'direct' && (
            <>
              <button
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Voice call (Coming soon)"
                disabled
              >
                <Phone className="w-5 h-5" />
              </button>
              <button
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Video call (Coming soon)"
                disabled
              >
                <Video className="w-5 h-5" />
              </button>
            </>
          )}
          <button
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Conversation info (Coming soon)"
            disabled
          >
            <Info className="w-5 h-5" />
          </button>
          <button
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="More options"
            disabled
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
