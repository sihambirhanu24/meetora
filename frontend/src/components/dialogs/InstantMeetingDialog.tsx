'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useWorkspaces } from '@/features/workspaces/hooks/use-workspaces';
import { useCreateMeeting } from '@/features/meetings/hooks/use-meetings';

interface InstantMeetingDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface InstantMeetingFormData {
  title: string;
  workspace: string;
  camera: boolean;
  microphone: boolean;
  participantEmails: string;
}

const VideoIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const MicIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
);

const CloseIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function InstantMeetingDialog({ isOpen, onClose }: InstantMeetingDialogProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { data: workspaces, isLoading: loadingWorkspaces } = useWorkspaces();
  const createMeeting = useCreateMeeting();
  const [isCreating, setIsCreating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<InstantMeetingFormData>({
    defaultValues: {
      title: `${user?.firstName}'s Quick Meeting`,
      workspace: 'personal',
      camera: true,
      microphone: true,
    },
  });

  const camera = watch('camera');
  const microphone = watch('microphone');

  const onSubmit = async (data: InstantMeetingFormData) => {
    if (isCreating) return;

    setIsCreating(true);
    try {
      const now = new Date();
      const endTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

      // Generate a unique meeting link
      const meetingCode = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const meeting = await createMeeting.mutateAsync({
        title: data.title,
        startTime: now.toISOString(),
        endTime: endTime.toISOString(),
        meetingType: 'instant',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        meetingLink: `meetora.app/join/${meetingCode}`,
      });

      // Navigate to meeting room with preferences
      const params = new URLSearchParams({
        camera: data.camera.toString(),
        microphone: data.microphone.toString(),
      });

      router.push(`/meetings/${meeting.id}?${params.toString()}`);
      onClose();
    } catch (error: any) {
      console.error('Failed to create instant meeting:', error);
      alert(error?.response?.data?.message || 'Failed to create meeting. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Start an instant meeting</h2>
            <p className="text-sm text-gray-600 mt-0.5">Get started in seconds</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-5">
          {/* Meeting Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-900 mb-2">
              Meeting title
            </label>
            <input
              {...register('title', {
                required: 'Meeting title is required',
                minLength: { value: 3, message: 'Title must be at least 3 characters' },
              })}
              type="text"
              id="title"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Quick team meeting"
            />
            {errors.title && (
              <p className="mt-1.5 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Workspace Selection */}
          <div>
            <label htmlFor="workspace" className="block text-sm font-medium text-gray-900 mb-2">
              Meeting space
            </label>
            <select
              {...register('workspace')}
              id="workspace"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              disabled={loadingWorkspaces}
            >
              <option value="personal">Personal Meeting Room</option>
              {workspaces?.map((workspace) => (
                <option key={workspace.id} value={workspace.id}>
                  {workspace.name}
                </option>
              ))}
            </select>
            {loadingWorkspaces && (
              <p className="mt-1.5 text-xs text-gray-500">Loading workspaces...</p>
            )}
          </div>

          {/* Audio/Video Settings */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-900">Audio and video settings</p>

            {/* Camera Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${camera ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                  <VideoIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Camera</p>
                  <p className="text-xs text-gray-600">
                    {camera ? 'On' : 'Off'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setValue('camera', !camera)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  camera ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    camera ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Microphone Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${microphone ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                  <MicIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Microphone</p>
                  <p className="text-xs text-gray-600">
                    {microphone ? 'On' : 'Off'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setValue('microphone', !microphone)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  microphone ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    microphone ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Info Message */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              You can adjust these settings in the meeting room before others join.
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isCreating}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isCreating}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isCreating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <VideoIcon className="w-4 h-4" />
                <span>Start meeting</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
