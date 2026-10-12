'use client';

import { useState } from 'react';
import Link from 'next/link';

type FilterType = 'all' | 'today' | 'upcoming';

export function ScheduledMeetingsPanel() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-lg">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[#14213D]">Scheduled Meetings</h2>
            <button className="text-slate-400 hover:text-slate-600" title="Info about scheduled meetings">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <Link
            href="/meetings/calendar"
            className="text-xs font-medium text-[#2563EB] hover:text-blue-600"
          >
            View calendar
          </Link>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter('today')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeFilter === 'today'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setActiveFilter('upcoming')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeFilter === 'upcoming'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Upcoming
          </button>
        </div>
      </div>

      {/* Empty State */}
      <div className="px-5 py-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-[#14213D] mb-1">No meetings scheduled</h3>
          <p className="text-xs text-[#64748B] mb-4 max-w-xs">
            Your scheduled meetings will appear here. Start by creating your first meeting.
          </p>
          <button className="px-4 py-2 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-blue-600 transition-colors">
            Schedule your first meeting
          </button>
        </div>
      </div>

      {/* Calendar Sync Card */}
      <div className="px-5 pb-5">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#14213D]">Calendar Integration</h4>
                <p className="text-xs text-[#64748B] mt-1">
                  Connect your calendar to sync meetings automatically
                </p>
              </div>
            </div>
            <Link
              href="/settings/integrations"
              className="text-xs font-medium text-[#2563EB] hover:text-blue-600 flex-shrink-0"
            >
              Connect
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
