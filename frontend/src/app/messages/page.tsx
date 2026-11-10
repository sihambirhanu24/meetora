'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { AppHeader } from '@/components/dashboard/AppHeader';
import { MobileNav } from '@/components/dashboard/MobileNav';
import { ConversationList } from '@/components/messages/ConversationList';
import { ConversationPanel } from '@/components/messages/ConversationPanel';
import { EmptyConversation } from '@/components/messages/EmptyConversation';
import { NewConversationModal } from '@/components/messages/NewConversationModal';
import { useConversations } from '@/features/messages/hooks/use-messages';

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationIdFromUrl = searchParams.get('conversation');
  const workspaceIdFromUrl = searchParams.get('workspace');

  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(conversationIdFromUrl);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [showMobileConversation, setShowMobileConversation] = useState(false);

  const { data: conversations, isLoading } = useConversations(
    workspaceIdFromUrl || undefined
  );

  // Update selected conversation when URL changes
  useEffect(() => {
    if (conversationIdFromUrl) {
      setSelectedConversationId(conversationIdFromUrl);
      setShowMobileConversation(true);
    }
  }, [conversationIdFromUrl]);

  // Filter conversations by search query
  const filteredConversations = conversations?.filter((conv) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();

    // Search by conversation name (for channels)
    if (conv.name?.toLowerCase().includes(query)) return true;

    // Search by participant names (for direct/group messages)
    return conv.participants.some(
      (p) =>
        p.user.firstName.toLowerCase().includes(query) ||
        p.user.lastName.toLowerCase().includes(query) ||
        p.user.email.toLowerCase().includes(query)
    );
  });

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setShowMobileConversation(true);

    // Update URL
    const params = new URLSearchParams();
    params.set('conversation', conversationId);
    if (workspaceIdFromUrl) {
      params.set('workspace', workspaceIdFromUrl);
    }
    router.push(`/messages?${params.toString()}`);
  };

  const handleBackToList = () => {
    setShowMobileConversation(false);
    setSelectedConversationId(null);

    // Update URL
    const params = new URLSearchParams();
    if (workspaceIdFromUrl) {
      params.set('workspace', workspaceIdFromUrl);
      router.push(`/messages?${params.toString()}`);
    } else {
      router.push('/messages');
    }
  };

  const handleConversationCreated = (conversationId: string) => {
    setShowNewConversation(false);
    handleSelectConversation(conversationId);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <AppHeader />

        {/* Messages Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Conversation List - Hidden on mobile when conversation is selected */}
          <div
            className={`${
              showMobileConversation ? 'hidden' : 'flex'
            } md:flex md:w-80 lg:w-96 flex-col border-r border-gray-200 bg-white`}
          >
            <ConversationList
              conversations={filteredConversations || []}
              selectedConversationId={selectedConversationId}
              onSelectConversation={handleSelectConversation}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onNewConversation={() => setShowNewConversation(true)}
              isLoading={isLoading}
            />
          </div>

          {/* Conversation Panel - Show on mobile only when conversation is selected */}
          <div
            className={`${
              showMobileConversation ? 'flex' : 'hidden'
            } md:flex flex-1 flex-col`}
          >
            {selectedConversationId ? (
              <ConversationPanel
                conversationId={selectedConversationId}
                onBack={handleBackToList}
              />
            ) : (
              <EmptyConversation
                onNewConversation={() => setShowNewConversation(true)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* New Conversation Modal */}
      {showNewConversation && (
        <NewConversationModal
          isOpen={showNewConversation}
          onClose={() => setShowNewConversation(false)}
          onConversationCreated={handleConversationCreated}
          workspaceId={workspaceIdFromUrl || undefined}
        />
      )}
    </div>
  );
}
