'use client';

import { MessageCircle } from 'lucide-react';

interface EmptyConversationProps {
  onNewConversation: () => void;
}

export function EmptyConversation({ onNewConversation }: EmptyConversationProps) {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <MessageCircle className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Select a conversation
        </h2>
        <p className="text-gray-500 mb-6">
          Choose from your existing conversations or start a new one to begin messaging
        </p>
        <button
          onClick={onNewConversation}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Start New Conversation
        </button>
      </div>
    </div>
  );
}
