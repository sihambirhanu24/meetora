'use client';

import { useRouter } from 'next/navigation';
import type { Workspace } from '@/features/workspaces/types';

interface WorkspaceCardProps {
  workspace: Workspace;
}

export function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  const router = useRouter();

  const getRoleBadge = (role?: string) => {
    const badges = {
      owner: { label: 'Owner', color: 'bg-purple-100 text-purple-800' },
      admin: { label: 'Admin', color: 'bg-blue-100 text-blue-800' },
      member: { label: 'Member', color: 'bg-green-100 text-green-800' },
      guest: { label: 'Guest', color: 'bg-gray-100 text-gray-800' },
    };

    const badge = badges[role as keyof typeof badges] || badges.member;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div
      onClick={() => router.push(`/workspaces/${workspace.id}`)}
      className="bg-white rounded-lg border border-[#E2E8F0] p-6 hover:border-[#2563EB] hover:shadow-md transition-all cursor-pointer group"
    >
      {/* Workspace Icon and Name */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
            <span className="text-xl font-bold text-[#2563EB]">
              {workspace.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="ml-3">
            <h3 className="text-base font-semibold text-[#14213D] group-hover:text-[#2563EB] transition-colors">
              {workspace.name}
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">/{workspace.slug}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      {workspace.description && (
        <p className="text-sm text-[#64748B] mb-4 line-clamp-2">
          {workspace.description}
        </p>
      )}

      {/* Metadata */}
      <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0]">
        <div className="flex items-center space-x-4">
          {/* Member Count */}
          <div className="flex items-center text-xs text-[#64748B]">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            {workspace.memberCount || 1} {workspace.memberCount === 1 ? 'member' : 'members'}
          </div>

          {/* Visibility */}
          {workspace.isPublic && (
            <div className="flex items-center text-xs text-[#64748B]">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Public
            </div>
          )}
        </div>

        {/* Role Badge */}
        <div>
          {getRoleBadge(workspace.myRole)}
        </div>
      </div>
    </div>
  );
}
