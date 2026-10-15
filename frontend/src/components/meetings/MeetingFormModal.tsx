'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateMeeting } from '@/features/meetings/hooks/use-meetings';

const meetingSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endDate: z.string().min(1, 'End date is required'),
  endTime: z.string().min(1, 'End time is required'),
  timezone: z.string().optional(),
  participantEmails: z.string().optional(),
});

type MeetingFormData = z.infer<typeof meetingSchema>;

interface MeetingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MeetingFormModal({ isOpen, onClose }: MeetingFormModalProps) {
  const createMeeting = useCreateMeeting();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MeetingFormData>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      timezone: 'UTC',
    },
  });

  const onSubmit = async (data: MeetingFormData) => {
    setIsSubmitting(true);
    
    // Combine date and time
    const startDateTime = `${data.startDate}T${data.startTime}:00`;
    const endDateTime = `${data.endDate}T${data.endTime}:00`;

    // Parse participant emails
    const participantEmails = data.participantEmails
      ? data.participantEmails.split(',').map((email) => email.trim()).filter(Boolean)
      : [];

    try {
      await createMeeting.mutateAsync({
        title: data.title,
        description: data.description,
        startTime: startDateTime,
        endTime: endDateTime,
        timezone: data.timezone || 'UTC',
        participantEmails,
      });

      reset();
      onClose();
    } catch (error) {
      console.error('Failed to create meeting:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[#E2E8F0] px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#14213D]">Schedule a Meeting</h2>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-[#14213D] mb-1.5">
              Meeting Title *
            </label>
            <input
              type="text"
              {...register('title')}
              className="w-full px-4 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Team Standup, Client Meeting"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[#14213D] mb-1.5">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-4 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Add meeting description, agenda, or notes..."
            />
          </div>

          {/* Start Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#14213D] mb-1.5">
                Start Date *
              </label>
              <input
                type="date"
                {...register('startDate')}
                className="w-full px-4 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.startDate && (
                <p className="mt-1 text-xs text-red-600">{errors.startDate.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#14213D] mb-1.5">
                Start Time *
              </label>
              <input
                type="time"
                {...register('startTime')}
                className="w-full px-4 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.startTime && (
                <p className="mt-1 text-xs text-red-600">{errors.startTime.message}</p>
              )}
            </div>
          </div>

          {/* End Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#14213D] mb-1.5">
                End Date *
              </label>
              <input
                type="date"
                {...register('endDate')}
                className="w-full px-4 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.endDate && (
                <p className="mt-1 text-xs text-red-600">{errors.endDate.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#14213D] mb-1.5">
                End Time *
              </label>
              <input
                type="time"
                {...register('endTime')}
                className="w-full px-4 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.endTime && (
                <p className="mt-1 text-xs text-red-600">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-sm font-medium text-[#14213D] mb-1.5">
              Timezone
            </label>
            <select
              {...register('timezone')}
              className="w-full px-4 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Europe/Paris">Paris (CET)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
            </select>
          </div>

          {/* Participants */}
          <div>
            <label className="block text-sm font-medium text-[#14213D] mb-1.5">
              Participants (optional)
            </label>
            <input
              type="text"
              {...register('participantEmails')}
              className="w-full px-4 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter email addresses separated by commas"
            />
            <p className="mt-1 text-xs text-[#64748B]">
              Example: john@example.com, jane@example.com
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Scheduling...' : 'Schedule Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
