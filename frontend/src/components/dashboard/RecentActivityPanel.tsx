'use client';

import Link from 'next/link';

export function RecentActivityPanel() {
  // This would typically fetch real activity data
  const hasActivity = false;

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-lg p-5">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#14213D]">Recent Activity</h3>
        <Link
          href="/activity"
          className="text-xs font-medium text-[#2563EB] hover:text-blue-600"
        >
          View all
        </Link>
      </div>

      {!hasActivity ? (
        <div className="py-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xs text-[#64748B] mb-3">No recent activity yet</p>
          <Link
            href="/workspaces"
            className="text-xs font-medium text-[#2563EB] hover:text-blue-600"
          >
            Explore workspaces
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Activity items would go here */}
        </div>
      )}
    </div>
  );
}
