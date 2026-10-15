'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { AppHeader } from '@/components/dashboard/AppHeader';
import { MobileNav } from '@/components/dashboard/MobileNav';
import { MeetingsOverview } from '@/components/meetings/MeetingsOverview';
import { MeetingTabs } from '@/components/meetings/MeetingTabs';
import { MeetingFilters } from '@/components/meetings/MeetingFilters';
import { MeetingList } from '@/components/meetings/MeetingList';
import { MeetingFormModal } from '@/components/meetings/MeetingFormModal';
import { useUpcomingMeetings, usePendingInvites, usePreviousMeetings } from '@/features/meetings/hooks/use-meetings';

type TabType = 'upcoming' | 'pending' | 'previous' | 'personal';

export default function MeetingsPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const { data: upcomingMeetings, isLoading: isLoadingUpcoming } = useUpcomingMeetings();
  const { data: pendingInvites, isLoading: isLoadingPending } = usePendingInvites();
  const { data: previousMeetings, isLoading: isLoadingPrevious } = usePreviousMeetings();

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

  // Get meetings based on active tab
  const getMeetingsForTab = () => {
    switch (activeTab) {
      case 'upcoming':
        return upcomingMeetings || [];
      case 'pending':
        return pendingInvites?.map(invite => invite.meeting) || [];
      case 'previous':
        return previousMeetings || [];
      case 'personal':
        return []; // Personal room view
      default:
        return [];
    }
  };

  const isLoadingMeetings = isLoadingUpcoming || isLoadingPending || isLoadingPrevious;

  // Filter meetings based on search and filters
  const filteredMeetings = getMeetingsForTab().filter((meeting) => {
    const matchesSearch = searchQuery
      ? meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        meeting.host.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        meeting.host.lastName.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesStatus = statusFilter === 'all' || meeting.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStartInstantCall = () => {
    // For now, open schedule modal with instant meeting type
    setIsScheduleModalOpen(true);
  };

  const tabCounts = {
    upcoming: upcomingMeetings?.length || 0,
    pending: pendingInvites?.length || 0,
    previous: previousMeetings?.length || 0,
    personal: 0,
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

        {/* Main Content */}
        <main className="p-4 sm:p-6">
          {/* Page Heading */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-[#14213D] mb-2">Meetings</h1>
            <p className="text-sm text-[#64748B]">
              Manage scheduled video calls, join upcoming rooms, and configure room settings.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={handleStartInstantCall}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Start Instant Call
              </div>
            </button>
            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-blue-600 transition-colors"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Schedule a Meeting
              </div>
            </button>
          </div>

          {/* Overview Panels */}
          <MeetingsOverview />

          {/* Meeting Tabs */}
          <div className="mb-6">
            <MeetingTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              counts={tabCounts}
            />
          </div>

          {/* Filters */}
          <MeetingFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
          />

          {/* Meeting List */}
          <MeetingList
            meetings={filteredMeetings}
            isLoading={isLoadingMeetings}
            activeTab={activeTab}
            pendingInvites={activeTab === 'pending' ? pendingInvites || [] : []}
          />

          {/* View Mode Selector - Bottom Center */}
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-10 hidden lg:block">
            <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-lg px-3 py-2">
              <div className="flex items-center gap-1">
                <button className="px-3 py-1.5 text-xs font-medium text-[#2563EB] bg-blue-50 rounded-md">
                  Activity
                </button>
                <button className="px-3 py-1.5 text-xs font-medium text-[#64748B] hover:text-[#14213D] hover:bg-slate-50 rounded-md transition-colors">
                  Agenda
                </button>
                <button className="px-3 py-1.5 text-xs font-medium text-[#64748B] hover:text-[#14213D] hover:bg-slate-50 rounded-md transition-colors">
                  Timeline
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Schedule Meeting Modal */}
      <MeetingFormModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
      />
    </div>
  );
}
