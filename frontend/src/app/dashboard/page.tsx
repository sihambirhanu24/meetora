'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { AppHeader } from '@/components/dashboard/AppHeader';
import { MobileNav } from '@/components/dashboard/MobileNav';
import { WelcomeSection } from '@/components/dashboard/WelcomeSection';
import { ProfileSummaryCard } from '@/components/dashboard/ProfileSummaryCard';
import { WorkspaceSummaryCard } from '@/components/dashboard/WorkspaceSummaryCard';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { QuickAccessCard } from '@/components/dashboard/QuickAccessCard';
import { ScheduledMeetingsPanel } from '@/components/dashboard/ScheduledMeetingsPanel';
import { MeetingRoomPanel } from '@/components/dashboard/MeetingRoomPanel';
import { DeviceCheckPanel } from '@/components/dashboard/DeviceCheckPanel';
import { RecentActivityPanel } from '@/components/dashboard/RecentActivityPanel';

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

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

  return (
    <div className="min-h-screen bg-slate-50">
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
          {/* Welcome Section */}
          <WelcomeSection />

          {/* Summary Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <ProfileSummaryCard />
            <WorkspaceSummaryCard />
            <StatsCard
              label="Active Workspaces"
              value="1"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              }
            />
          </div>

          {/* Quick Access Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <QuickAccessCard
              title="Upcoming Meetings"
              description="View and manage your scheduled meetings and calendar"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              href="/meetings"
              linkText="View calendar"
            />
            <QuickAccessCard
              title="My Workspaces"
              description="Access and manage all your team workspaces"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              }
              href="/workspaces"
              linkText="Manage spaces"
            />
            <QuickAccessCard
              title="Cloud Recordings"
              description="Browse and share your recorded meetings"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              }
              href="/recordings"
              linkText="Browse recordings"
            />
            <QuickAccessCard
              title="Chat & Channels"
              description="Connect with your team through messages"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              }
              href="/messages"
              linkText="Open messages"
            />
          </div>

          {/* Main Content Grid - Two Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Scheduled Meetings (takes 2 columns on large screens) */}
            <div className="lg:col-span-2">
              <ScheduledMeetingsPanel />
            </div>

            {/* Right Column - Utility Panels (takes 1 column on large screens) */}
            <div className="space-y-6">
              <MeetingRoomPanel />
              <DeviceCheckPanel />
              <RecentActivityPanel />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
