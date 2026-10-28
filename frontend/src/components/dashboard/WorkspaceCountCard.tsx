'use client';

import { useWorkspaces } from '@/features/workspaces/hooks/use-workspaces';
import Link from 'next/link';

export function WorkspaceCountCard() {
  const { data: workspaces, isLoading } = useWorkspaces();

  return (
    <Link href="/workspaces" className="block">
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 hover:border-[#2563EB] transition-colors">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-[#64748B] font-medium">Active Workspaces</p>
            {isLoading ? (
              <div className="h-8 w-12 bg-slate-200 animate-pulse rounded mt-2"></div>
            ) : (
              <p className="text-2xl font-semibold text-[#14213D] mt-2">{workspaces?.length || 0}</p>
            )}
          </div>
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
