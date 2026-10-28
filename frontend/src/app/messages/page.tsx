'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useConversations, useMessages, useSendMessage, useCreateConversation } from '@/features/messages/hooks/use-messages';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { AppHeader } from '@/components/dashboard/AppHeader';
import { MobileNav } from '@/components/dashboard/MobileNav';
import { ConversationList } from '@/components/messages/ConversationList';
import { MessageList } from '@/components/messages/MessageList';
import { MessageComposer } from '@/components/messages/MessageComposer';
import { ConversationHeader } from '@/components/messages/ConversationHeader';
import { SearchBar } from '@/components/messages/SearchBar';
import { EmptyConversation } from '@/components/messages/EmptyConversation';
import { NewConversationModal } from '@/components/messages/NewConversationModal';
import type { Conversation } from '@/features/messages/types';

export default function MessagesPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);

  // Fetch conversations
  const { data: conversations, isLoading: isLoadingConversations } = useConversations();

  // Fetch messages for active conversation
  const { data: messages, isLoading: isLoadingMessages } = useMessages(activeConversationId || '');

  // Send message mutation
  const sendMessageMutation = useSendMessage();

  // Create conversation mutation
  const createConversationMutation = useCreateConversation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/sign-in');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB]"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Filter conversations based on search
  const filteredConversations = conversations?.filter((conv: Conversation) =>
    conv.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Get active conversation
  const activeConversation = conversations?.find(
    (conv: Conversation) => conv.id === activeConversationId
  );

  // Handle conversation selection
  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    // On mobile, hide conversation list when a conversation is selected
    setShowConversationList(false);
  };

  // Handle back to conversation list (mobile)
  const handleBackToList = () => {
    setShowConversationList(true);
    setActiveConversationId(null);
  };

  // Handle send message
  const handleSendMessage = async (content: string) => {
    if (!activeConversationId) return;

    try {
      await sendMessageMutation.mutateAsync({
        conversationId: activeConversationId,
        data: { content },
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Handle create conversation
  const handleCreateConversation = async (data: any) => {
    try {
      const newConversation = await createConversationMutation.mutateAsync(data);
      setActiveConversationId(newConversation.id);
      setShowConversationList(false);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Mobile Navigation */}
      <MobileNav />

      {/* Sidebar - Desktop Only */}
      <div className="hidden lg:block">
        <AppSidebar />
      </div>

      {/* Main Content Area */}
      <div className="lg:ml-52 pt-16 lg:pt-0 transition-all duration-300">
        {/* Header - Desktop Only */}
        <div className="hidden lg:block">
          <AppHeader />
        </div>

        {/* Messages Layout */}
        <div className="h-[calc(100vh-4rem)] lg:h-screen lg:pt-16 flex">
          {/* Conversation List Sidebar - Desktop: always visible, Mobile: conditional */}
          <div
            className={`${
              showConversationList ? 'flex' : 'hidden'
            } lg:flex flex-col w-full lg:w-80 xl:w-96 bg-white border-r border-slate-200`}
          >
            {/* Header */}
            <div className="flex-shrink-0 px-4 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-[#14213D]">Messages</h2>
                <button
                  onClick={() => setIsNewConversationModalOpen(true)}
                  className="p-2 text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors"
                  title="New conversation"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              {/* Search */}
              <SearchBar onSearch={setSearchQuery} />
            </div>

            {/* Conversation List */}
            <ConversationList
              conversations={filteredConversations}
              activeConversationId={activeConversationId || undefined}
              onSelectConversation={handleSelectConversation}
              isLoading={isLoadingConversations}
            />
          </div>

          {/* Message Panel - Desktop: always visible, Mobile: conditional */}
          <div
            className={`${
              !showConversationList ? 'flex' : 'hidden'
            } lg:flex flex-1 flex-col bg-white`}
          >
            {activeConversationId && activeConversation ? (
              <>
                {/* Conversation Header */}
                <ConversationHeader
                  conversation={activeConversation}
                  onBack={handleBackToList}
                />

                {/* Messages */}
                <MessageList
                  messages={messages || []}
                  currentUserId={user.id}
                  isLoading={isLoadingMessages}
                />

                {/* Message Composer */}
                <MessageComposer
                  onSendMessage={handleSendMessage}
                  isSending={sendMessageMutation.isPending}
                  disabled={false}
                />
              </>
            ) : (
              <>
                {/* Empty State - Desktop only */}
                <div className="hidden lg:flex flex-1">
                  <EmptyConversation />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* New Conversation Modal */}
      <NewConversationModal
        isOpen={isNewConversationModalOpen}
        onClose={() => setIsNewConversationModalOpen(false)}
        onCreateConversation={handleCreateConversation}
      />
    </div>
  );
}
