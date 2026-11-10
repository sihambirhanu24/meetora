'use client';

import { useState } from 'react';
import { X, Search, Hash, Users as UsersIcon, MessageCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateConversation } from '@/features/messages/hooks/use-messages';

const conversationSchema = z.object({
  type: z.enum(['direct', 'group', 'channel']),
  name: z.string().optional(),
  description: z.string().optional(),
  isPrivate: z.boolean().optional(),
  participantIds: z.array(z.string()).min(1, 'At least one participant is required'),
});

type ConversationFormData = z.infer<typeof conversationSchema>;

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConversationCreated: (conversationId: string) => void;
  workspaceId?: string;
}

export function NewConversationModal({
  isOpen,
  onClose,
  onConversationCreated,
  workspaceId,
}: NewConversationModalProps) {
  const [conversationType, setConversationType] = useState<
    'direct' | 'group' | 'channel'
  >('direct');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const createConversationMutation = useCreateConversation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ConversationFormData>({
    resolver: zodResolver(conversationSchema),
    defaultValues: {
      type: 'direct',
      isPrivate: false,
    },
  });

  // Mock users - In real app, fetch from API
  const availableUsers = [
    {
      id: 'user-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      profileImage: null,
    },
    {
      id: 'user-2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      profileImage: null,
    },
  ];

  const filteredUsers = availableUsers.filter((user) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.firstName.toLowerCase().includes(query) ||
      user.lastName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  });

  const toggleUserSelection = (userId: string) => {
    if (conversationType === 'direct') {
      // For direct messages, only one user can be selected
      setSelectedUserIds([userId]);
    } else {
      // For group/channel, multiple users can be selected
      setSelectedUserIds((prev) =>
        prev.includes(userId)
          ? prev.filter((id) => id !== userId)
          : [...prev, userId]
      );
    }
  };

  const onSubmit = async (data: ConversationFormData) => {
    try {
      const result = await createConversationMutation.mutateAsync({
        ...data,
        type: conversationType,
        participantIds: selectedUserIds,
        workspaceId: conversationType === 'channel' ? workspaceId : undefined,
      });

      onConversationCreated(result.id);
      reset();
      setSelectedUserIds([]);
      setSearchQuery('');
      onClose();
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            New Conversation
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit(onSubmit)} id="conversation-form">
            {/* Conversation Type */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Conversation Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setConversationType('direct');
                    setSelectedUserIds([]);
                  }}
                  className={`p-4 border-2 rounded-lg text-center transition-colors ${
                    conversationType === 'direct'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <MessageCircle
                    className={`w-6 h-6 mx-auto mb-2 ${
                      conversationType === 'direct'
                        ? 'text-blue-600'
                        : 'text-gray-400'
                    }`}
                  />
                  <div className="text-sm font-medium text-gray-900">
                    Direct
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    1-on-1 message
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setConversationType('group');
                    setSelectedUserIds([]);
                  }}
                  className={`p-4 border-2 rounded-lg text-center transition-colors ${
                    conversationType === 'group'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <UsersIcon
                    className={`w-6 h-6 mx-auto mb-2 ${
                      conversationType === 'group'
                        ? 'text-blue-600'
                        : 'text-gray-400'
                    }`}
                  />
                  <div className="text-sm font-medium text-gray-900">Group</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Multiple people
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setConversationType('channel');
                    setSelectedUserIds([]);
                  }}
                  className={`p-4 border-2 rounded-lg text-center transition-colors ${
                    conversationType === 'channel'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${!workspaceId ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!workspaceId}
                >
                  <Hash
                    className={`w-6 h-6 mx-auto mb-2 ${
                      conversationType === 'channel'
                        ? 'text-blue-600'
                        : 'text-gray-400'
                    }`}
                  />
                  <div className="text-sm font-medium text-gray-900">
                    Channel
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Workspace channel
                  </div>
                </button>
              </div>
            </div>

            {/* Channel/Group Name */}
            {(conversationType === 'channel' || conversationType === 'group') && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {conversationType === 'channel' ? 'Channel' : 'Group'} Name
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  {...register('name')}
                  placeholder={`Enter ${conversationType} name`}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
            )}

            {/* Channel Description */}
            {conversationType === 'channel' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  {...register('description')}
                  placeholder="What's this channel about?"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            )}

            {/* Privacy */}
            {conversationType === 'channel' && (
              <div className="mb-6">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    {...register('isPrivate')}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      Private Channel
                    </div>
                    <div className="text-xs text-gray-500">
                      Only invited members can access
                    </div>
                  </div>
                </label>
              </div>
            )}

            {/* User Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add {conversationType === 'direct' ? 'Person' : 'People'}
                <span className="text-red-500 ml-1">*</span>
              </label>

              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search people..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* User List */}
              <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-64 overflow-y-auto">
                {filteredUsers.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No users found
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <label
                      key={user.id}
                      className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-blue-700">
                          {user.firstName[0]}
                          {user.lastName[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {user.email}
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>

              {selectedUserIds.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  Select at least one person to start a conversation
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="conversation-form"
            disabled={
              selectedUserIds.length === 0 ||
              createConversationMutation.isPending
            }
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {createConversationMutation.isPending ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
