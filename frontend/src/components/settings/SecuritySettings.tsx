'use client';

import { useProfile } from '@/features/profile/hooks/use-profile';

export function SecuritySettings() {
  const { profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-[#E2E8F0] p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Security Overview Card */}
      <div className="bg-white rounded-lg border border-[#E2E8F0]">
        <div className="px-6 py-4 border-b border-[#E2E8F0]">
          <h2 className="text-lg font-semibold text-[#14213D]">Security Overview</h2>
          <p className="text-sm text-[#64748B] mt-0.5">
            Monitor and manage your account security
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {/* Email Verification Status */}
            <div className="flex items-start justify-between py-3 border-b border-[#E2E8F0]">
              <div className="flex items-start">
                <div className={`mt-0.5 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  profile.emailVerified ? 'bg-green-100' : 'bg-yellow-100'
                }`}>
                  {profile.emailVerified ? (
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-[#14213D]">Email Verification</h3>
                  <p className="text-sm text-[#64748B] mt-0.5">
                    {profile.emailVerified 
                      ? 'Your email address has been verified'
                      : 'Your email address needs verification'}
                  </p>
                </div>
              </div>
              {!profile.emailVerified && (
                <button className="px-4 py-2 text-sm font-medium text-[#2563EB] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  Resend Email
                </button>
              )}
            </div>

            {/* Password Last Changed */}
            <div className="flex items-start py-3 border-b border-[#E2E8F0]">
              <div className="mt-0.5 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-[#14213D]">Password</h3>
                <p className="text-sm text-[#64748B] mt-0.5">
                  Last changed: {new Date(profile.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* Account Status */}
            <div className="flex items-start py-3">
              <div className="mt-0.5 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-[#14213D]">Account Status</h3>
                <p className="text-sm text-[#64748B] mt-0.5 capitalize">
                  Your account is {profile.accountStatus}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Factor Authentication (Future Feature) */}
      <div className="bg-white rounded-lg border border-[#E2E8F0]">
        <div className="px-6 py-4 border-b border-[#E2E8F0]">
          <h2 className="text-lg font-semibold text-[#14213D]">Two-Factor Authentication</h2>
          <p className="text-sm text-[#64748B] mt-0.5">
            Add an extra layer of security to your account
          </p>
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <div className="mt-0.5 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-[#14213D]">2FA Status</h3>
                <p className="text-sm text-[#64748B] mt-0.5">
                  Two-factor authentication is not enabled
                </p>
              </div>
            </div>
            <button
              disabled
              className="px-4 py-2 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Two-factor authentication will be available in a future update"
            >
              Enable 2FA
            </button>
          </div>
          <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-4">
            <p className="text-xs text-[#64748B]">
              <strong>Coming soon:</strong> Two-factor authentication adds an extra layer of security by requiring a verification code in addition to your password.
            </p>
          </div>
        </div>
      </div>

      {/* Active Sessions (Future Feature) */}
      <div className="bg-white rounded-lg border border-[#E2E8F0]">
        <div className="px-6 py-4 border-b border-[#E2E8F0]">
          <h2 className="text-lg font-semibold text-[#14213D]">Active Sessions</h2>
          <p className="text-sm text-[#64748B] mt-0.5">
            Manage devices where you're currently signed in
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {/* Current Session */}
            <div className="flex items-start justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-start">
                <div className="mt-0.5 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <div className="flex items-center">
                    <h3 className="text-sm font-medium text-[#14213D]">Current Browser</h3>
                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">
                      Active Now
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Your current session • Last active: Just now
                  </p>
                </div>
              </div>
            </div>

            {/* Info about sessions */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mt-4">
              <p className="text-xs text-[#64748B]">
                <strong>Note:</strong> Session management features will be enhanced in a future update to show all active devices and allow remote sign-out.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Recommendations */}
      <div className="bg-white rounded-lg border border-[#E2E8F0]">
        <div className="px-6 py-4 border-b border-[#E2E8F0]">
          <h2 className="text-lg font-semibold text-[#14213D]">Security Recommendations</h2>
          <p className="text-sm text-[#64748B] mt-0.5">
            Tips to keep your account secure
          </p>
        </div>
        <div className="p-6">
          <ul className="space-y-3">
            <li className="flex items-start">
              <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="ml-3 text-sm text-[#14213D]">
                Use a strong, unique password
              </p>
            </li>
            <li className="flex items-start">
              <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${profile.emailVerified ? 'text-green-600' : 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={profile.emailVerified ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" : "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"} />
              </svg>
              <p className="ml-3 text-sm text-[#14213D]">
                {profile.emailVerified ? 'Email address verified ✓' : 'Verify your email address'}
              </p>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="ml-3 text-sm text-[#14213D]">
                Enable two-factor authentication (coming soon)
              </p>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="ml-3 text-sm text-[#14213D]">
                Review active sessions regularly
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
