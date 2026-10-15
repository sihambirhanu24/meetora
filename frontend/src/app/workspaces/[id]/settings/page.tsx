'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useWorkspace, useUpdateWorkspace, useDeleteWorkspace } from '@/features/workspaces/hooks/use-workspaces';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { AppHeader } from '@/components/dashboard/AppHeader';
import { MobileNav } from '@/components/dashboard/MobileNav';

const workspaceSchema = z.object({
  name: z.string().min(1, 'Workspace name is required').max(100, 'Name is too long'),
  description: z.string().max(500, 'Description is too long').optional().or(z.literal('')),
  isPublic: z.boolean(),
});

type WorkspaceFormData = z.infer<typeof workspaceSchema>;

export default function WorkspaceSettingsPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const workspaceId = params?.id as string;

  const { data: workspace, isLoading: workspaceLoading } = useWorkspace(workspaceId);
  const updateWorkspace = useUpdateWorkspace(workspaceId);
  const deleteWorkspace = useDeleteWorkspace();
  const [successMessage, setSuccessMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<WorkspaceFormData>({
    resolver: zodResolver(workspaceSchema),
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/sign-in');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (workspace) {
      reset({
        name: workspace.name,
        description: workspace.description || '',
        isPublic: workspace.isPublic,
      });
    }
  }, [workspace, reset]);

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

  // Check permissions
  const canManage = workspace.myRole === 'owner' || workspace.myRole === 'admin';
  const isOwner = workspace.myRole === 'owner';

  if (!canManage) {
    router.push(`/workspaces/${workspaceId}`);
    return null;
  }

  const onSubmit = async (data: WorkspaceFormData) => {
    try {
      setSuccessMessage('');
      await updateWorkspace.mutateAsync({
        name: data.name,
        description: data.description || undefined,
        isPublic: data.isPublic,
      });
      setSuccessMessage('Workspace updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Update workspace error:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${workspace.name}"? This action cannot be undone.`)) {
      return;
    }

    const confirmText = prompt(
      `Type "${workspace.name}" to confirm deletion:`
    );

    if (confirmText !== workspace.name) {
      alert('Workspace name did not match. Deletion cancelled.');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteWorkspace.mutateAsync(workspaceId);
      router.push('/workspaces');
    } catch (error) {
      console.error('Delete workspace error:', error);
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AppSidebar />
      <MobileNav />
      
      <div className="lg:pl-52">
        <AppHeader />
        
        <main className="p-6 max-w-4xl">
          {/* Breadcrumb */}
          <div className="mb-6">
            <nav className="flex items-center text-sm text-[#64748B]">
              <Link href="/workspaces" className="hover:text-[#2563EB] transition-colors">
                Workspaces
              </Link>
              <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <Link href={`/workspaces/${workspaceId}`} className="hover:text-[#2563EB] transition-colors">
                {workspace.name}
              </Link>
              <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-[#14213D] font-medium">Settings</span>
            </nav>
          </div>

          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-[#14213D]">Workspace Settings</h1>
            <p className="text-sm text-[#64748B] mt-1">
              Manage workspace information and preferences
            </p>
          </div>

          {/* General Settings Card */}
          <div className="bg-white rounded-lg border border-[#E2E8F0] mb-6">
            <div className="px-6 py-4 border-b border-[#E2E8F0]">
              <h2 className="text-lg font-semibold text-[#14213D]">General Information</h2>
              <p className="text-sm text-[#64748B] mt-0.5">
                Update workspace name, description, and visibility
              </p>
            </div>

            <div className="p-6">
              {successMessage && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-green-700 font-medium">{successMessage}</p>
                  </div>
                </div>
              )}

              {updateWorkspace.isError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-700 font-medium">
                      {(updateWorkspace.error as any)?.response?.data?.message || 
                        'Failed to update workspace. Please try again.'}
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-[#14213D] mb-1.5">
                    Workspace Name *
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    id="name"
                    className="w-full px-4 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-[#14213D] mb-1.5">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    id="description"
                    rows={3}
                    className="w-full px-4 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  {errors.description && (
                    <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div className="flex items-start">
                  <input
                    {...register('isPublic')}
                    type="checkbox"
                    id="isPublic"
                    className="mt-1 w-4 h-4 text-[#2563EB] border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isPublic" className="ml-3">
                    <span className="block text-sm font-medium text-[#14213D]">Make workspace public</span>
                    <span className="block text-xs text-[#64748B] mt-0.5">
                      Public workspaces can be discovered by other users
                    </span>
                  </label>
                </div>

                <div className="pt-4 border-t border-[#E2E8F0] flex justify-end">
                  <button
                    type="submit"
                    disabled={!isDirty || isSubmitting || updateWorkspace.isPending}
                    className="px-6 py-2.5 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting || updateWorkspace.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Danger Zone */}
          {isOwner && (
            <div className="bg-white rounded-lg border border-red-200">
              <div className="px-6 py-4 border-b border-red-200">
                <h2 className="text-lg font-semibold text-red-700">Danger Zone</h2>
                <p className="text-sm text-[#64748B] mt-0.5">
                  Irreversible actions that affect this workspace
                </p>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-[#14213D]">Delete Workspace</h3>
                    <p className="text-sm text-[#64748B] mt-0.5">
                      Permanently delete this workspace and all associated data
                    </p>
                  </div>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Workspace'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
