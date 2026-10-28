'use client';

import { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/use-auth';

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateConversation: (data: {
    type: 'direct' | 'group' | 'channel';
    name?: string;
    description?: string;
    participantIds: string[];
  }) => void;
}

export function NewConversationModal({
  isOpen,
  onClose,
  onCreateConversation,
}: NewConversationModalProps) {
  const { user } = useAuth();
  const [type, setType] = useState<'direct' | 'group' | 'channel'>('direct');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [participantEmail, setParticipantEmail] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // For now, we'll create a simple structure
    // In a real app, you'd have a user search/selection component
    const data = {
      type,
      name: type !== 'direct' ? name : undefined,
      description: type === 'channel' ? description : undefined,
      participantIds: [], // Would be populated from user selection
    };

    onCreateConversation(data);
    handleClose();
  };

  const handleClose = () => {
    setType('direct');
    setName('');
    setDescription('');
    setParticipantEmail('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#14213D]">
              New Conversation
            </h2>
            <button
              onClick={handleClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Conversation Type */}
          <div>
            <label className="block text-sm font-medium text-[#14213D] mb-2">
              Conversation Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('direct')}
                className={`px-3 py-2 text-sm rounded-lg border-2 transition-colors ${
                  type === 'direct'
                    ? 'border-[#2563EB] bg-blue-50 text-[#2563EB] font-medium'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                Direct
              </button>
              <button
                type="button"
                onClick={() => setType('group')}
                className={`px-3 py-2 text-sm rounded-lg border-2 transition-colors ${
                  type === 'group'
                    ? 'border-[#2563EB] bg-blue-50 text-[#2563EB] font-medium'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                Group
              </button>
              <button
                type="button"
                onClick={() => setType('channel')}
                className={`px-3 py-2 text-sm rounded-lg border-2 transition-colors ${
                  type === 'channel'
                    ? 'border-[#2563EB] bg-blue-50 text-[#2563EB] font-medium'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                Channel
              </button>
            </div>
          </div>

          {/* Name (for groups and channels) */}
          {type !== 'direct' && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#14213D] mb-2">
                {type === 'channel' ? 'Channel Name' : 'Group Name'}
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={type === 'channel' ? 'e.g., general' : 'e.g., Project Team'}
                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}

          {/* Description (for channels) */}
          {type === 'channel' && (
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-[#14213D] mb-2">
                Description <span className="text-slate-400">(optional)</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this channel about?"
                rows={3}
                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          )}

          {/* Participants */}
          <div>
            <label htmlFor="participants" className="block text-sm font-medium text-[#14213D] mb-2">
              Add Members
            </label>
            <input
              type="email"
              id="participants"
              value={participantEmail}
              onChange={(e) => setParticipantEmail(e.target.value)}
              placeholder="Enter email address"
              className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              Feature requires user search functionality - coming soon
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-blue-600 transition-colors"
          >
            Create Conversation
          </button>
        </div>
      </div>
    </div>
  );
}
