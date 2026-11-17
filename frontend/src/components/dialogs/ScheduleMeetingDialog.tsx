'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateMeeting } from '@/features/meetings/hooks/use-meetings';
import { useWorkspaces } from '@/features/workspaces/hooks/use-workspaces';
import { MEETINGS_QUERY_KEYS } from '@/features/meetings/hooks/use-meetings';

interface ScheduleMeetingDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const DURATION_OPTIONS = [
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '1.5 hours', value: 90 },
  { label: '2 hours', value: 120 },
];

export function ScheduleMeetingDialog({ isOpen, onClose }: ScheduleMeetingDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTimeInput, setStartTimeInput] = useState('');
  const [duration, setDuration] = useState(60);
  const [workspaceId, setWorkspaceId] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const createMeeting = useCreateMeeting();
  const { data: workspaces, isLoading: loadingWorkspaces } = useWorkspaces();
  const queryClient = useQueryClient();

  if (!isOpen) return null;

  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validation
    if (!title.trim()) {
      setError('Meeting title is required');
      return;
    }

    if (!date) {
      setError('Date is required');
      return;
    }

    if (!startTimeInput) {
      setError('Start time is required');
      return;
    }

    const startDateTime = new Date(`${date}T${startTimeInput}`);
    const now = new Date();

    if (startDateTime < now) {
      setError('Start time must be in the future');
      return;
    }

    const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 1000);

    try {
      await createMeeting.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        meetingType: 'scheduled',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        participantEmails: [],
        ...(workspaceId ? { workspaceId } : {}),
      });

      // Invalidate meetings cache
      queryClient.invalidateQueries({ queryKey: MEETINGS_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: MEETINGS_QUERY_KEYS.upcoming });

      setSuccessMessage('Meeting scheduled successfully!');

      // Reset form after short delay, then close
      setTimeout(() => {
        resetAndClose();
      }, 1200);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      setError(apiErr.response?.data?.message || 'Failed to create meeting');
    }
  };

  const resetAndClose = () => {
    setTitle('');
    setDescription('');
    setDate('');
    setStartTimeInput('');
    setDuration(60);
    setWorkspaceId('');
    setError('');
    setSuccessMessage('');
    onClose();
  };

  const handleClose = () => {
    resetAndClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#14213D]">Schedule a Meeting</h2>
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

          {/* Title */}
          <div>
            <label htmlFor="sched-title" className="block text-sm font-medium text-[#14213D] mb-2">
              Meeting Title *
            </label>
            <input
              type="text"
              id="sched-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Team Standup"
              className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="sched-description" className="block text-sm font-medium text-[#14213D] mb-2">
              Description (optional)
            </label>
            <textarea
              id="sched-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this meeting about?"
              rows={3}
              className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="sched-date" className="block text-sm font-medium text-[#14213D] mb-2">
                Date *
              </label>
              <input
                type="date"
                id="sched-date"
                value={date}
                min={getTodayString()}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="sched-time" className="block text-sm font-medium text-[#14213D] mb-2">
                Start Time *
              </label>
              <input
                type="time"
                id="sched-time"
                value={startTimeInput}
                onChange={(e) => setStartTimeInput(e.target.value)}
                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label htmlFor="sched-duration" className="block text-sm font-medium text-[#14213D] mb-2">
              Duration
            </label>
            <select
              id="sched-duration"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {DURATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Workspace */}
          <div>
            <label htmlFor="sched-workspace" className="block text-sm font-medium text-[#14213D] mb-2">
              Workspace (optional)
            </label>
            <select
              id="sched-workspace"
              value={workspaceId}
              onChange={(e) => setWorkspaceId(e.target.value)}
              disabled={loadingWorkspaces}
              className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-50"
            >
              <option value="">No workspace (personal)</option>
              {workspaces?.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.name}
                </option>
              ))}
            </select>
            {loadingWorkspaces && (
              <p className="mt-1 text-xs text-slate-500">Loading workspaces...</p>
            )}
          </div>
        </form>

        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={createMeeting.isPending}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={createMeeting.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-blue-600 transition-colors disabled:bg-slate-300 flex items-center gap-2"
          >
            {createMeeting.isPending && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            )}
            {createMeeting.isPending ? 'Scheduling...' : 'Schedule Meeting'}
          </button>
        </div>
      </div>
    </div>
  );
}
