'use client';

import Link from 'next/link';
import { useWorkspaces } from '@/features/workspaces/hooks/use-workspaces';

export function WorkspaceSummaryCard() {
  const { data: workspaces, isLoading } = useWorkspaces();
  
  // Get first workspace or show personal workspace message
  const primaryWorkspace = workspaces && workspaces.length > 0 ? workspaces[0] : null;

  if (isLoading) {
    return (
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 animate-pulse">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-lg bg-slate-200"></div>
          <div className="flex-1">
            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link href={primaryWorkspace ? `/workspaces/${primaryWorkspace.id}` : '/workspaces'} className="block">
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 hover:border-[#2563EB] transition-colors">
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
            {primaryWorkspace ? (
              <>
                <h3 className="text-sm font-semibold text-[#14213D] truncate">{primaryWorkspace.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-block px-2 py-0.5 text-xs font-medium text-slate-600 bg-slate-100 rounded capitalize">
                    {primaryWorkspace.myRole || 'Member'}
                  </span>
                  {!primaryWorkspace.isPublic && (
                    <span className="text-xs text-slate-500">🔒</span>
                  )}
                </div>
                <p className="text-xs text-[#64748B] mt-2 line-clamp-1">
                  {primaryWorkspace.description || `${primaryWorkspace.memberCount || 0} members`}
                </p>
              </>
            ) : (
              <>
                <h3 className="text-sm font-semibold text-[#14213D]">Personal Workspace</h3>
                <span className="inline-block px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-50 rounded mt-1">
                  No workspaces yet
                </span>
                <p className="text-xs text-[#64748B] mt-2">
                  Create a workspace to collaborate with your team
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
