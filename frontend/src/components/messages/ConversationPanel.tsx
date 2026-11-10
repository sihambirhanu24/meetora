'use client';

import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Send,
  Smile,
  Paperclip,
  MoreVertical,
  Users,
  Info,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import {
  useConversation,
  useMessages,
  useSendMessage,
  useMarkAsRead,
} from '@/features/messages/hooks/use-messages';
import { MessageItem } from './MessageItem';
import { ConversationHeader } from './ConversationHeader';

interface ConversationPanelProps {
  conversationId: string;
  onBack: () => void;
}

export function ConversationPanel({
  conversationId,
  onBack,
}: ConversationPanelProps) {
  const [messageContent, setMessageContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversation, isLoading: isLoadingConversation } =
    useConversation(conversationId);
  const { data: messages, isLoading: isLoadingMessages } =
    useMessages(conversationId);
  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkAsRead();

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages) {
      scrollToBottom();
    }
  }, [messages]);

  // Mark as read when conversation is opened
  useEffect(() => {
    if (conversationId && conversation) {
      markAsReadMutation.mutate(conversationId);
    }
  }, [conversationId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageContent.trim() || isSending) return;

    const content = messageContent.trim();
    setMessageContent('');
    setIsSending(true);

    try {
      await sendMessageMutation.mutateAsync({
        conversationId,
        data: {
          content,
          type: 'text',
        },
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessageContent(content); // Restore message on error
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  if (isLoadingConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            Conversation not found
          </h3>
          <p className="text-sm text-gray-500">
            This conversation may have been deleted
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <ConversationHeader
        conversation={conversation}
        onBack={onBack}
      />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : messages && messages.length > 0 ? (
          <>
            {messages.map((message, index) => {
              const prevMessage = index > 0 ? messages[index - 1] : null;
              const showSender =
                !prevMessage || prevMessage.senderId !== message.senderId;

              return (
                <MessageItem
                  key={message.id}
                  message={message}
                  showSender={showSender}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No messages yet
              </h3>
              <p className="text-sm text-gray-500">
                Start the conversation by sending a message
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Message Composer */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
          {/* Attachment button */}
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Attach file (Coming soon)"
            disabled
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Message input */}
          <div className="flex-1 relative">
            <textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{
                minHeight: '42px',
                maxHeight: '120px',
              }}
              disabled={isSending}
            />
            <button
              type="button"
              className="absolute right-2 bottom-2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
              title="Emoji (Coming soon)"
              disabled
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>

          {/* Send button */}
          <button
            type="submit"
            disabled={!messageContent.trim() || isSending}
            className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Send message"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>

        {/* Send hint */}
        <p className="mt-2 text-xs text-gray-500">
          Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">Shift+Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
}
