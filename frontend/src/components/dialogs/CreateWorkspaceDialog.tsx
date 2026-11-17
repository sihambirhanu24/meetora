'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateWorkspace } from '@/features/workspaces/hooks/use-workspaces';

interface CreateWorkspaceDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function CreateWorkspaceDialog({ isOpen, onClose }: CreateWorkspaceDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const router = useRouter();
  const createWorkspace = useCreateWorkspace();

  if (!isOpen) return null;

  const slug = generateSlug(name);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Workspace name is required');
      return;
    }
    if (trimmedName.length < 2) {
      setError('Workspace name must be at least 2 characters');
      return;
    }
    if (trimmedName.length > 50) {
      setError('Workspace name must be 50 characters or fewer');
      return;
    }

    try {
      const workspace = await createWorkspace.mutateAsync({
        name: trimmedName,
        description: description.trim() || undefined,
        slug,
      });

      setSuccessMessage(`Workspace "${workspace.name}" created!`);

      setTimeout(() => {
        resetAndClose();
        router.push(`/workspaces/${workspace.id}`);
      }, 1000);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      setError(apiErr.response?.data?.message || 'Failed to create workspace');
    }
  };

  const resetAndClose = () => {
    setName('');
    setDescription('');
    setError('');
    setSuccessMessage('');
    onClose();
  };

  const handleClose = () => {
    resetAndClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#14213D]">Create Workspace</h2>
            <button
              onClick={handleClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {successMessage}
            </div>
          )}

          <div>
            <label htmlFor="workspace-name" className="block text-sm font-medium text-[#14213D] mb-2">
              Workspace Name *{' '}
              <span className="text-xs text-slate-400 font-normal">(2–50 characters)</span>
            </label>
            <input
              type="text"
              id="workspace-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Marketing Team"
              maxLength={50}
              className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {/* Character counter + slug preview */}
            <div className="mt-1 flex items-center justify-between">
              {slug && (
                <p className="text-xs text-slate-500">
                  Slug: <span className="font-mono text-slate-600">{slug}</span>
                </p>
              )}
              <p className={`text-xs ml-auto ${name.length > 50 ? 'text-red-500' : 'text-slate-400'}`}>
                {name.length}/50
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="workspace-description" className="block text-sm font-medium text-[#14213D] mb-2">
              Description (optional)
            </label>
            <textarea
              id="workspace-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this workspace for?"
              rows={3}
              className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </form>

        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={createWorkspace.isPending}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={createWorkspace.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-blue-600 transition-colors disabled:bg-slate-300 flex items-center gap-2"
          >
            {createWorkspace.isPending && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            )}
            {createWorkspace.isPending ? 'Creating...' : 'Create Workspace'}
          </button>
        </div>
      </div>
    </div>
  );
}
