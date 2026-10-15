'use client';

import { useState } from 'react';

export function NotificationSettings() {
  // These are UI-only for now since backend notification system isn't implemented
  const [emailNotifications, setEmailNotifications] = useState({
    meetingInvites: true,
    meetingReminders: true,
    meetingCancellations: true,
    messageNotifications: false,
    workspaceUpdates: true,
    securityAlerts: true,
    productUpdates: false,
    weeklyDigest: false,
  });

  const handleToggle = (key: keyof typeof emailNotifications) => {
    setEmailNotifications(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Email Notifications Card */}
      <div className="bg-white rounded-lg border border-[#E2E8F0]">
        <div className="px-6 py-4 border-b border-[#E2E8F0]">
          <h2 className="text-lg font-semibold text-[#14213D]">Email Notifications</h2>
          <p className="text-sm text-[#64748B] mt-0.5">
            Choose what emails you'd like to receive
          </p>
        </div>
        <div className="p-6">
          {/* Info Banner */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong className="font-semibold">Note:</strong> Notification preferences are saved locally for demonstration. 
                  Backend notification system integration is planned for a future update.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Meeting Notifications */}
            <div className="pb-4 border-b border-[#E2E8F0]">
              <h3 className="text-sm font-semibold text-[#14213D] mb-3">Meeting Notifications</h3>
              <div className="space-y-3">
                <NotificationToggle
                  label="Meeting Invites"
                  description="Get notified when you're invited to a meeting"
                  checked={emailNotifications.meetingInvites}
                  onChange={() => handleToggle('meetingInvites')}
                />
                <NotificationToggle
                  label="Meeting Reminders"
                  description="Receive reminders before meetings start"
                  checked={emailNotifications.meetingReminders}
                  onChange={() => handleToggle('meetingReminders')}
                />
                <NotificationToggle
                  label="Meeting Cancellations"
                  description="Get notified when meetings are cancelled"
                  checked={emailNotifications.meetingCancellations}
                  onChange={() => handleToggle('meetingCancellations')}
                />
              </div>
            </div>

            {/* Communication Notifications */}
            <div className="pb-4 border-b border-[#E2E8F0]">
              <h3 className="text-sm font-semibold text-[#14213D] mb-3">Communication</h3>
              <div className="space-y-3">
                <NotificationToggle
                  label="Message Notifications"
                  description="Get notified of new direct messages"
                  checked={emailNotifications.messageNotifications}
                  onChange={() => handleToggle('messageNotifications')}
                />
                <NotificationToggle
                  label="Workspace Updates"
                  description="Receive updates about workspace changes and announcements"
                  checked={emailNotifications.workspaceUpdates}
                  onChange={() => handleToggle('workspaceUpdates')}
                />
              </div>
            </div>

            {/* Account & Security */}
            <div className="pb-4 border-b border-[#E2E8F0]">
              <h3 className="text-sm font-semibold text-[#14213D] mb-3">Account & Security</h3>
              <div className="space-y-3">
                <NotificationToggle
                  label="Security Alerts"
                  description="Important notifications about your account security"
                  checked={emailNotifications.securityAlerts}
                  onChange={() => handleToggle('securityAlerts')}
                  disabled
                  disabledNote="Security alerts are always enabled for your protection"
                />
              </div>
            </div>

            {/* Product Updates */}
            <div>
              <h3 className="text-sm font-semibold text-[#14213D] mb-3">Product Updates</h3>
              <div className="space-y-3">
                <NotificationToggle
                  label="Product Updates"
                  description="Learn about new features and improvements"
                  checked={emailNotifications.productUpdates}
                  onChange={() => handleToggle('productUpdates')}
                />
                <NotificationToggle
                  label="Weekly Digest"
                  description="Weekly summary of your meetings and activities"
                  checked={emailNotifications.weeklyDigest}
                  onChange={() => handleToggle('weeklyDigest')}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Push Notifications (Future) */}
      <div className="bg-white rounded-lg border border-[#E2E8F0]">
        <div className="px-6 py-4 border-b border-[#E2E8F0]">
          <h2 className="text-lg font-semibold text-[#14213D]">Push Notifications</h2>
          <p className="text-sm text-[#64748B] mt-0.5">
            Browser and mobile push notifications
          </p>
        </div>
        <div className="p-6">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-slate-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-[#64748B]">
                  Push notifications are not yet available. This feature will be added in a future update.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface NotificationToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  disabledNote?: string;
}

function NotificationToggle({ label, description, checked, onChange, disabled, disabledNote }: NotificationToggleProps) {
  return (
    <div className="flex items-start justify-between py-2">
      <div className="flex-1">
        <label className="text-sm font-medium text-[#14213D] cursor-pointer">
          {label}
        </label>
        <p className="text-xs text-[#64748B] mt-0.5">{description}</p>
        {disabled && disabledNote && (
          <p className="text-xs text-blue-600 mt-1">{disabledNote}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onChange}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          checked ? 'bg-[#2563EB]' : 'bg-slate-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
