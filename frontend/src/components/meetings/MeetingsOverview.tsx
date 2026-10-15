'use client';

import { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useTodayCount } from '@/features/meetings/hooks/use-meetings';

export function MeetingsOverview() {
  const { user } = useAuth();
  const { data: todayCountData } = useTodayCount();
  const [copied, setCopied] = useState(false);
  const [deviceCheckCompleted, setDeviceCheckCompleted] = useState(false);
  const [deviceStatus, setDeviceStatus] = useState({
    camera: 'unchecked',
    microphone: 'unchecked',
    speaker: 'unchecked',
    network: 'unchecked',
  });

  const todayCount = todayCountData?.count || 0;
  const meetingRoomUrl = `meetora.app/join/${user?.id?.slice(0, 8) || 'personal'}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://${meetingRoomUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeviceCheck = async () => {
    // Simulate device check
    setDeviceCheckCompleted(true);
    
    // Check devices (simplified version)
    setTimeout(() => {
      setDeviceStatus({
        camera: 'available',
        microphone: 'available',
        speaker: 'available',
        network: 'good',
      });
    }, 1500);
  };

  const getStatusIcon = (status: string) => {
    if (status === 'unchecked') {
      return (
        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    if (status === 'available' || status === 'good') {
      return (
        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {/* Today's Agenda */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-[#14213D]">Today's Agenda</h3>
            <p className="text-xs text-[#64748B] mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-[#14213D]">{todayCount}</span>
          <span className="text-sm text-[#64748B]">
            {todayCount === 1 ? 'meeting' : 'meetings'} today
          </span>
        </div>
        {todayCount > 0 && (
          <p className="text-xs text-[#64748B] mt-2">
            Next meeting starts soon
          </p>
        )}
      </div>

      {/* Personal Meeting Room */}
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
            <p className="text-xs text-[#64748B] mt-1">{user?.firstName}'s Room</p>
          </div>
        </div>
        
        <div className="mb-3">
          <label className="text-xs font-medium text-slate-700 block mb-1.5">Meeting Link</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-2.5 py-1.5 text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200 rounded-md truncate">
              {meetingRoomUrl}
            </div>
            <button
              onClick={handleCopyLink}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors flex-shrink-0"
              title="Copy link"
            >
              {copied ? (
                <span className="flex items-center gap-1 text-green-600">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Copied
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </span>
              )}
            </button>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-[#2563EB] rounded-md hover:bg-blue-600 transition-colors">
            Join Room
          </button>
          <button className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors">
            Settings
          </button>
        </div>
      </div>

      {/* Hardware & Network */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-[#14213D]">Hardware & Network</h3>
            <p className="text-xs text-[#64748B] mt-1">Pre-flight check</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        {!deviceCheckCompleted ? (
          <div className="text-center py-4">
            <button
              onClick={handleDeviceCheck}
              className="px-4 py-2 text-xs font-medium text-[#2563EB] hover:text-blue-600 transition-colors"
            >
              Run Hardware Check
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="font-medium text-slate-700">Camera</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-600">Ready</span>
                {getStatusIcon(deviceStatus.camera)}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <span className="font-medium text-slate-700">Microphone</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-600">Ready</span>
                {getStatusIcon(deviceStatus.microphone)}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                <span className="font-medium text-slate-700">Speaker</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-600">Ready</span>
                {getStatusIcon(deviceStatus.speaker)}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                </svg>
                <span className="font-medium text-slate-700">Network</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-600">Good</span>
                {getStatusIcon(deviceStatus.network)}
              </div>
            </div>

            <button
              onClick={handleDeviceCheck}
              className="w-full mt-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors"
            >
              Check Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
