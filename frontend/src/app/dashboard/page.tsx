'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/features/auth/hooks/use-auth';

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/sign-in');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="text-2xl font-bold text-primary-600">
                Meetora
              </Link>
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className="text-primary-600 font-medium px-3 py-2 rounded-md"
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md transition-colors"
                >
                  Profile
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt="Profile"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium text-primary-600">
                      {user.firstName.charAt(0)}
                      {user.lastName.charAt(0)}
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-700">
                  {user.firstName} {user.lastName}
                </span>
              </div>
              <button
                onClick={() => logout()}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.firstName}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here's what's happening with your account today.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Summary Card */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Profile Summary</h2>
              </div>
              <div className="px-6 py-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt="Profile"
                          className="h-16 w-16 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-primary-600">
                          {user.firstName.charAt(0)}
                          {user.lastName.charAt(0)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900">
                      {user.firstName} {user.lastName}
                    </h3>
                    {user.jobTitle && (
                      <p className="text-sm text-gray-500 mt-1">{user.jobTitle}</p>
                    )}
                    {user.bio && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{user.bio}</p>
                    )}
                    <div className="mt-4 flex items-center space-x-4">
                      <Link
                        href="/profile"
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        View Full Profile →
                      </Link>
                    </div>
                  </div>
                </div>

                <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="bg-gray-50 px-4 py-3 rounded-md">
                    <dt className="text-xs font-medium text-gray-500 uppercase">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 rounded-md">
                    <dt className="text-xs font-medium text-gray-500 uppercase">Status</dt>
                    <dd className="mt-1">
                      {user.emailVerified ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Not Verified
                        </span>
                      )}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 rounded-md">
                    <dt className="text-xs font-medium text-gray-500 uppercase">Account Status</dt>
                    <dd className="mt-1 text-sm text-gray-900 capitalize">{user.accountStatus}</dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 rounded-md">
                    <dt className="text-xs font-medium text-gray-500 uppercase">Member Since</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                      })}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="px-6 py-6">
                <div className="space-y-3">
                  <Link
                    href="/profile"
                    className="block w-full text-left px-4 py-3 bg-primary-50 text-primary-700 rounded-md hover:bg-primary-100 transition-colors font-medium"
                  >
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Edit Profile
                    </div>
                  </Link>
                  <Link
                    href="/auth/change-password"
                    className="block w-full text-left px-4 py-3 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors font-medium"
                  >
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Change Password
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Email Verification Alert */}
            {!user.emailVerified && (
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <svg className="w-5 h-5 text-yellow-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">Verify Your Email</h3>
                    <p className="mt-1 text-sm text-yellow-700">
                      Please check your email and verify your account to access all features.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Future Features Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-lg p-6 border-2 border-dashed border-gray-300">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gray-100 text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Meetings</h3>
            <p className="mt-2 text-sm text-gray-500">
              Schedule and manage meetings (Coming in Module 3)
            </p>
          </div>

          <div className="bg-white shadow rounded-lg p-6 border-2 border-dashed border-gray-300">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gray-100 text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Workspaces</h3>
            <p className="mt-2 text-sm text-gray-500">
              Collaborate with teams (Coming soon)
            </p>
          </div>

          <div className="bg-white shadow rounded-lg p-6 border-2 border-dashed border-gray-300">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gray-100 text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Analytics</h3>
            <p className="mt-2 text-sm text-gray-500">
              Track your activity (Coming soon)
            </p>
          </div>
        </div>

        {/* Module Status */}
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Development Progress</h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                ✓ Module 1: Authentication & Security
              </span>
              <span className="ml-3 text-sm text-gray-500">Complete</span>
            </div>
            <div className="flex items-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                ✓ Module 2: User Profiles & Dashboard
              </span>
              <span className="ml-3 text-sm text-gray-500">Complete</span>
            </div>
            <div className="flex items-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                Module 3: Meetings & Scheduling
              </span>
              <span className="ml-3 text-sm text-gray-500">Coming next</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
