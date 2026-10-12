'use client';

import { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/use-auth';

export function MeetingRoomPanel() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  // Generate a placeholder meeting URL based on user
  const meetingUrl = `meetora.app/join/${user?.id?.slice(0, 8) || 'demo'}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://${meetingUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-lg p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#14213D]">Personal Meeting Room</h3>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-xs text-green-600 font-medium">Available</span>
            </div>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            {user?.firstName}'s Room
          </p>
        </div>
      </div>

      {/* Meeting Link */}
      <div className="mb-4">
        <label className="text-xs font-medium text-slate-700 block mb-2">Meeting Link</label>
        <div className="flex items-center gap-2">
          <div className="flex-1 px-3 py-2 text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200 rounded-lg truncate">
            {meetingUrl}
          </div>
          <button
            onClick={handleCopyLink}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex-shrink-0"
            title="Copy link"
          >
            {copied ? (
              <span className="flex items-center gap-1 text-green-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Copied
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-blue-600 transition-colors">
          Join now
        </button>
        <button className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
          Settings
        </button>
      </div>
    </div>
  );
}
