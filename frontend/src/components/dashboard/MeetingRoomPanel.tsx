'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/use-auth';

export function MeetingRoomPanel() {
  const { user } = useAuth();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Generate personal meeting room URL using user's email username
  const generateRoomId = () => {
    if (!user?.email) return 'personal-room';
    const emailUsername = user.email.split('@')[0];
    return `${emailUsername}-${user.id.slice(0, 6)}`;
  };

  const roomId = generateRoomId();
  
  // Use actual domain from environment or fallback
  const domain = typeof window !== 'undefined' 
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || 'https://meetora.app';
  
  const meetingUrl = `${domain}/meetings/personal-${roomId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(meetingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleJoinNow = () => {
    // Navigate to personal meeting room
    router.push(`/meetings/personal-${roomId}`);
  };

  return (
    <>
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
              {user?.firstName}'s Room • ID: {roomId}
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
          <button 
            onClick={handleJoinNow}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-blue-600 transition-colors"
          >
            Join now
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Settings
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#14213D]">Personal Room Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-slate-600 mb-4">
                Your personal meeting room is always available. Share the link with anyone to invite them to join.
              </p>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-slate-700">Room ID:</span>
                  <span className="ml-2 text-slate-600 font-mono">{roomId}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Host:</span>
                  <span className="ml-2 text-slate-600">{user?.firstName} {user?.lastName}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Status:</span>
                  <span className="ml-2 text-green-600">Active</span>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-blue-600 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
