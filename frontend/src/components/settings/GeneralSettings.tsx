'use client';

import { useProfile } from '@/features/profile/hooks/use-profile';

export function GeneralSettings() {
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
      {/* Account Information Card */}
      <div className="bg-white rounded-lg border border-[#E2E8F0]">
        <div className="px-6 py-4 border-b border-[#E2E8F0]">
          <h2 className="text-lg font-semibold text-[#14213D]">Account Information</h2>
          <p className="text-sm text-[#64748B] mt-0.5">
            View your account details and verification status
          </p>
        </div>
        <div className="p-6">
          <dl className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-[#E2E8F0]">
              <div>
                <dt className="text-sm font-medium text-[#14213D]">Email Address</dt>
                <dd className="text-sm text-[#64748B] mt-0.5">{profile.email}</dd>
              </div>
              <div>
                {profile.emailVerified ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Unverified
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-[#E2E8F0]">
              <div>
                <dt className="text-sm font-medium text-[#14213D]">Account Status</dt>
                <dd className="text-sm text-[#64748B] mt-0.5 capitalize">{profile.accountStatus}</dd>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Active
              </span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <dt className="text-sm font-medium text-[#14213D]">Member Since</dt>
                <dd className="text-sm text-[#64748B] mt-0.5">
                  {new Date(profile.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </dd>
              </div>
            </div>
          </dl>
        </div>
      </div>

      {/* Email Preferences */}
      <div className="bg-white rounded-lg border border-[#E2E8F0]">
        <div className="px-6 py-4 border-b border-[#E2E8F0]">
          <h2 className="text-lg font-semibold text-[#14213D]">Email Preferences</h2>
          <p className="text-sm text-[#64748B] mt-0.5">
            Manage how you receive email communications
          </p>
        </div>
        <div className="p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Email preferences can be managed in the <strong>Notifications</strong> tab.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-lg border border-red-200">
        <div className="px-6 py-4 border-b border-red-200">
          <h2 className="text-lg font-semibold text-red-700">Danger Zone</h2>
          <p className="text-sm text-[#64748B] mt-0.5">
            Irreversible actions that affect your account
          </p>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-[#14213D]">Delete Account</h3>
              <p className="text-sm text-[#64748B] mt-0.5">
                Permanently delete your account and all associated data
              </p>
            </div>
            <button
              disabled
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Account deletion must be requested through support"
            >
              Delete Account
            </button>
          </div>
          <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-4">
            <p className="text-xs text-[#64748B]">
              <strong>Note:</strong> Account deletion is not available through self-service. 
              Please contact support if you wish to delete your account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
