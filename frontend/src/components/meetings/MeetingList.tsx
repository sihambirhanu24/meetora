'use client';

import { MeetingCard } from './MeetingCard';
import type { Meeting, PendingInvite } from '@/features/meetings/types';

interface MeetingListProps {
  meetings: Meeting[];
  isLoading: boolean;
  activeTab: 'upcoming' | 'pending' | 'previous' | 'personal';
  pendingInvites?: PendingInvite[];
}

export function MeetingList({ meetings, isLoading, activeTab, pendingInvites }: MeetingListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-[#E2E8F0] rounded-lg p-5 animate-pulse">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-slate-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activeTab === 'personal') {
    return (
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#14213D] mb-2">Your Personal Meeting Room</h3>
          <p className="text-sm text-[#64748B] mb-6">
            Use your personal room for instant meetings. Share your link with participants to join anytime.
          </p>
          <button className="px-6 py-3 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-blue-600 transition-colors">
            Open Personal Room
          </button>
        </div>
      </div>
    );
  }

  if (meetings.length === 0) {
    const emptyMessages = {
      upcoming: {
        title: 'No upcoming meetings',
        description: "You don't have any scheduled meetings coming up. Schedule a new meeting to get started.",
        action: 'Schedule a Meeting',
      },
      pending: {
        title: 'No pending invites',
        description: "You don't have any pending meeting invitations at the moment.",
        action: null,
      },
      previous: {
        title: 'No past meetings',
        description: "Your meeting history will appear here once you've attended or hosted meetings.",
        action: null,
      },
      personal: {
        title: 'Personal Room',
        description: '',
        action: null,
      },
    };

    const message = emptyMessages[activeTab];

    return (
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#14213D] mb-2">{message.title}</h3>
          <p className="text-sm text-[#64748B]">{message.description}</p>
          {message.action && (
            <button className="mt-6 px-6 py-3 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-blue-600 transition-colors">
              {message.action}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {meetings.map((meeting) => {
        const pendingInvite = pendingInvites?.find(
          (invite) => invite.meetingId === meeting.id
        );
        return (
          <MeetingCard
            key={meeting.id}
            meeting={meeting}
            isPending={!!pendingInvite}
            pendingInvite={pendingInvite}
          />
        );
      })}
    </div>
  );
}
