'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useCreateWorkspace } from '@/features/workspaces/hooks/use-workspaces';

const workspaceSchema = z.object({
  name: z.string().min(1, 'Workspace name is required').max(100, 'Name is too long'),
  description: z.string().max(500, 'Description is too long').optional().or(z.literal('')),
  slug: z.string()
    .regex(/^[a-z0-9-]*$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .max(100, 'Slug is too long')
    .optional()
    .or(z.literal('')),
  isPublic: z.boolean().optional(),
});

type WorkspaceFormData = z.infer<typeof workspaceSchema>;

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateWorkspaceModal({ isOpen, onClose }: CreateWorkspaceModalProps) {
  const router = useRouter();
  const createWorkspace = useCreateWorkspace();
  const [successMessage, setSuccessMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<WorkspaceFormData>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      isPublic: false,
    },
  });

  const name = watch('name');

  // Auto-generate slug suggestion from name
  const suggestedSlug = name
    ?.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const onSubmit = async (data: WorkspaceFormData) => {
    try {
      setSuccessMessage('');
      const workspace = await createWorkspace.mutateAsync({
        name: data.name,
        description: data.description || undefined,
        slug: data.slug || undefined,
        isPublic: data.isPublic || false,
      });
      
      setSuccessMessage('Workspace created successfully!');
      reset();
      
      // Redirect to new workspace after a short delay
      setTimeout(() => {
        onClose();
        router.push(`/workspaces/${workspace.id}`);
      }, 1000);
    } catch (error: any) {
      console.error('Create workspace error:', error);
    }
  };

  const handleClose = () => {
    reset();
    setSuccessMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#E2E8F0] px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#14213D]">Create New Workspace</h2>
            <button
              onClick={handleClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mx-6 mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-green-700 font-medium">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {createWorkspace.isError && (
          <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700 font-medium">
                {(createWorkspace.error as any)?.response?.data?.message || 
                  'Failed to create workspace. Please try again.'}
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Workspace Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#14213D] mb-1.5">
              Workspace Name *
            </label>
            <input
              {...register('name')}
              type="text"
              id="name"
              className="w-full px-4 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Acme Inc, Design Team, Marketing"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-[#14213D] mb-1.5">
              Description
            </label>
            <textarea
              {...register('description')}
              id="description"
              rows={3}
              className="w-full px-4 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Brief description of this workspace..."
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
            )}
            <p className="mt-1.5 text-xs text-[#64748B]">
              Optional. Maximum 500 characters.
            </p>
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-[#14213D] mb-1.5">
              URL Slug
            </label>
            <input
              {...register('slug')}
              type="text"
              id="slug"
              className="w-full px-4 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={suggestedSlug || 'my-workspace'}
            />
            {errors.slug && (
              <p className="mt-1 text-xs text-red-600">{errors.slug.message}</p>
            )}
            <p className="mt-1.5 text-xs text-[#64748B]">
              Optional. Leave empty to auto-generate from name. Only lowercase letters, numbers, and hyphens.
            </p>
          </div>

          {/* Visibility */}
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

          {/* Submit Button */}
          <div className="pt-4 border-t border-[#E2E8F0] flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2.5 text-sm font-medium border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || createWorkspace.isPending}
              className="px-6 py-2.5 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || createWorkspace.isPending ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create Workspace'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
