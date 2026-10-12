'use client';

import { useState } from 'react';

interface DeviceStatus {
  camera: 'checking' | 'available' | 'unavailable';
  microphone: 'checking' | 'available' | 'unavailable';
  speaker: 'checking' | 'available' | 'unavailable';
  connection: 'checking' | 'good' | 'poor';
}

export function DeviceCheckPanel() {
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>({
    camera: 'checking',
    microphone: 'checking',
    speaker: 'checking',
    connection: 'checking',
  });

  const [hasChecked, setHasChecked] = useState(false);

  const handleCheckDevices = async () => {
    setHasChecked(true);
    // Simulate device check
    setTimeout(() => {
      setDeviceStatus({
        camera: 'available',
        microphone: 'available',
        speaker: 'available',
        connection: 'good',
      });
    }, 1500);
  };

  const getStatusIcon = (status: string) => {
    if (status === 'checking') {
      return (
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
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

  const getStatusText = (status: string) => {
    if (status === 'checking') return 'Checking...';
    if (status === 'available' || status === 'good') return 'Ready';
    return 'Unavailable';
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-lg p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#14213D]">Pre-Flight Hardware</h3>
          <p className="text-xs text-[#64748B] mt-1">
            Check your devices before joining
          </p>
        </div>
      </div>

      {!hasChecked ? (
        <div className="py-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <button
            onClick={handleCheckDevices}
            className="px-4 py-2 text-sm font-medium text-[#2563EB] hover:text-blue-600 transition-colors"
          >
            Check devices
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Camera */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-medium text-slate-700">Camera</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600">{getStatusText(deviceStatus.camera)}</span>
              {getStatusIcon(deviceStatus.camera)}
            </div>
          </div>

          {/* Microphone */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span className="text-xs font-medium text-slate-700">Microphone</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600">{getStatusText(deviceStatus.microphone)}</span>
              {getStatusIcon(deviceStatus.microphone)}
            </div>
          </div>

          {/* Speaker */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              <span className="text-xs font-medium text-slate-700">Speaker</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600">{getStatusText(deviceStatus.speaker)}</span>
              {getStatusIcon(deviceStatus.speaker)}
            </div>
          </div>

          {/* Connection */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              </svg>
              <span className="text-xs font-medium text-slate-700">Connection</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600">{getStatusText(deviceStatus.connection)}</span>
              {getStatusIcon(deviceStatus.connection)}
            </div>
          </div>

          <button
            onClick={handleCheckDevices}
            className="w-full mt-2 px-4 py-2 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Check again
          </button>
        </div>
      )}
    </div>
  );
}
