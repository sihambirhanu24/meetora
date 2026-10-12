'use client';

import { useAuth } from '@/features/auth/hooks/use-auth';

export function WorkspaceSummaryCard() {
  const { user } = useAuth();

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-lg p-4">
      <div className="flex items-start gap-3">
        {/* Workspace Icon */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-[#14213D]">Personal Workspace</h3>
          <span className="inline-block px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-50 rounded mt-1">
            Free Plan
          </span>
          <p className="text-xs text-[#64748B] mt-2">
            Your private workspace for meetings and collaboration
          </p>
        </div>
      </div>
    </div>
  );
}
