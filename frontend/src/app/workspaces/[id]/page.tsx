'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useWorkspace, useWorkspaceMembers } from '@/features/workspaces/hooks/use-workspaces';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { AppHeader } from '@/components/dashboard/AppHeader';
import { MobileNav } from '@/components/dashboard/MobileNav';
import { MemberList } from '@/components/workspaces/MemberList';
import { InviteMemberModal } from '@/components/workspaces/InviteMemberModal';

export default function WorkspaceDetailPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const workspaceId = params?.id as string;

  const { data: workspace, isLoading: workspaceLoading, error } = useWorkspace(workspaceId);
  const { data: members, isLoading: membersLoading } = useWorkspaceMembers(workspaceId);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/sign-in');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (error && (error as any)?.response?.status === 403) {
      router.push('/workspaces');
    }
  }, [error, router]);

  if (authLoading || workspaceLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB]"></div>
      </div>
    );
  }

  if (!user || !workspace) {
    return null;
  }

  const canManageWorkspace = workspace.myRole === 'owner' || workspace.myRole === 'admin';

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AppSidebar />
      <MobileNav />
      
      <div className="lg:pl-52">
        <AppHeader />
        
        <main className="p-6">
          {/* Breadcrumb */}
          <div className="mb-6">
            <nav className="flex items-center text-sm text-[#64748B]">
              <Link href="/workspaces" className="hover:text-[#2563EB] transition-colors">
                Workspaces
              </Link>
              <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-[#14213D] font-medium">{workspace.name}</span>
            </nav>
          </div>

          {/* Workspace Header */}
          <div className="bg-white rounded-lg border border-[#E2E8F0] p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <div className="w-16 h-16 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-[#2563EB]">
                    {workspace.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-semibold text-[#14213D]">{workspace.name}</h1>
                  <p className="text-sm text-[#64748B] mt-1">/{workspace.slug}</p>
                  {workspace.description && (
                    <p className="text-sm text-[#64748B] mt-2">{workspace.description}</p>
                  )}
                  <div className="flex items-center space-x-4 mt-3">
                    <div className="flex items-center text-sm text-[#64748B]">
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      {workspace.memberCount} {workspace.memberCount === 1 ? 'member' : 'members'}
                    </div>
                    {workspace.isPublic && (
                      <div className="flex items-center text-sm text-[#64748B]">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Public
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {canManageWorkspace && (
                  <>
                    <button
                      onClick={() => setIsInviteModalOpen(true)}
                      className="px-4 py-2.5 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Invite Members
                    </button>
                    <Link
                      href={`/workspaces/${workspaceId}/settings`}
                      className="px-4 py-2.5 text-sm font-medium border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Settings
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Members Section */}
          {membersLoading ? (
            <div className="bg-white rounded-lg border border-[#E2E8F0] p-6 animate-pulse">
              <div className="h-6 bg-slate-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-slate-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : members && members.length > 0 ? (
            <MemberList
              workspaceId={workspaceId}
              members={members}
              myRole={workspace.myRole || 'member'}
              currentUserId={user.id}
            />
          ) : null}
        </main>
      </div>

      {/* Invite Member Modal */}
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        workspaceId={workspaceId}
        workspaceName={workspace.name}
      />
    </div>
  );
}
