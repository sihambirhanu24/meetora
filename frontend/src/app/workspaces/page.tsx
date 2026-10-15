'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useWorkspaces } from '@/features/workspaces/hooks/use-workspaces';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { AppHeader } from '@/components/dashboard/AppHeader';
import { MobileNav } from '@/components/dashboard/MobileNav';
import { WorkspaceCard } from '@/components/workspaces/WorkspaceCard';
import { CreateWorkspaceModal } from '@/components/workspaces/CreateWorkspaceModal';
import type { Workspace } from '@/features/workspaces/types';

export default function WorkspacesPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { data: workspaces, isLoading: workspacesLoading } = useWorkspaces();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/sign-in');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB]"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Filter workspaces based on search query
  const filteredWorkspaces = workspaces?.filter((workspace) => {
    const query = searchQuery.toLowerCase();
    return (
      workspace.name.toLowerCase().includes(query) ||
      workspace.description?.toLowerCase().includes(query) ||
      workspace.slug.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AppSidebar />
      <MobileNav />
      
      <div className="lg:pl-52">
        <AppHeader />
        
        <main className="p-6">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-2xl font-semibold text-[#14213D]">Workspaces</h1>
                <p className="text-sm text-[#64748B] mt-1">
                  Manage your workspaces and collaborate with your team
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2.5 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-blue-600 transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Workspace
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="Search workspaces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-2.5 w-5 h-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Workspaces Grid */}
          {workspacesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg border border-[#E2E8F0] p-6 animate-pulse">
                  <div className="h-6 bg-slate-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                </div>
              ))}
            </div>
          ) : filteredWorkspaces && filteredWorkspaces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorkspaces.map((workspace) => (
                <WorkspaceCard key={workspace.id} workspace={workspace} />
              ))}
            </div>
          ) : searchQuery ? (
            <div className="bg-white rounded-lg border border-[#E2E8F0] p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[#14213D] mb-2">No workspaces found</h3>
                <p className="text-sm text-[#64748B]">
                  No workspaces match your search &quot;{searchQuery}&quot;. Try a different search term.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-[#E2E8F0] p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[#14213D] mb-2">No workspaces yet</h3>
                <p className="text-sm text-[#64748B] mb-6">
                  Get started by creating your first workspace to collaborate with your team.
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-6 py-3 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Your First Workspace
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
