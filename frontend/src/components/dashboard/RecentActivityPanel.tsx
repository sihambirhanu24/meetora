'use client';

import Link from 'next/link';
import { useMeetings } from '@/features/meetings/hooks/use-meetings';
import { formatDistanceToNow } from 'date-fns';

export function RecentActivityPanel() {
  // Get recent meetings (all statuses)
  const { data: meetings, isLoading } = useMeetings();

  // Get last 5 meetings (any status)
  const recentMeetings = meetings?.slice(0, 5) || [];

  const getActivityIcon = (meetingType: string, status: string) => {
    if (status === 'completed') {
      return (
        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
    if (status === 'cancelled') {
      return (
        <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
          <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  };

  const getActivityText = (status: string, meetingType: string) => {
    if (status === 'completed') return 'Completed';
    if (status === 'cancelled') return 'Cancelled';
    if (status === 'in_progress') return 'In progress';
    if (meetingType === 'instant') return 'Started instant meeting';
    return 'Scheduled';
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-lg p-5">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#14213D]">Recent Activity</h3>
        <Link
          href="/meetings"
          className="text-xs font-medium text-[#2563EB] hover:text-blue-600"
        >
          View all
        </Link>
      </div>

      {isLoading ? (
        <div className="py-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#2563EB]"></div>
        </div>
      ) : recentMeetings.length === 0 ? (
        <div className="py-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xs text-[#64748B] mb-3">No recent activity yet</p>
          <Link
            href="/meetings"
            className="text-xs font-medium text-[#2563EB] hover:text-blue-600"
          >
            Schedule a meeting
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {recentMeetings.map((meeting) => (
            <Link
              key={meeting.id}
              href={`/meetings/${meeting.id}`}
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              {getActivityIcon(meeting.meetingType, meeting.status)}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[#14213D] truncate">
                  {meeting.title}
                </p>
                <p className="text-xs text-[#64748B]">
                  {getActivityText(meeting.status, meeting.meetingType)}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {formatDistanceToNow(new Date(meeting.createdAt), { addSuffix: true })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
