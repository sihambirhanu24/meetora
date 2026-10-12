'use client';

import Link from 'next/link';
import { useAuth } from '@/features/auth/hooks/use-auth';

export function ProfileSummaryCard() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-lg p-4">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt=""
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <span className="text-base font-semibold text-[#2563EB]">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-[#14213D]">
            {user.firstName} {user.lastName}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            {user.emailVerified ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-green-700 bg-green-50 rounded">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-yellow-700 bg-yellow-50 rounded">
                Not Verified
              </span>
            )}
          </div>
          <p className="text-xs text-[#64748B] mt-2">{user.email}</p>
          <Link
            href="/profile"
            className="inline-flex items-center gap-1 text-xs font-medium text-[#2563EB] hover:text-blue-600 mt-3"
          >
            View profile
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
