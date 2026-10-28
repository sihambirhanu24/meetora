'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useCreateMeeting } from '@/features/meetings/hooks/use-meetings';
import { ScheduleMeetingDialog } from '../dialogs/ScheduleMeetingDialog';
import { CreateWorkspaceDialog } from '../dialogs/CreateWorkspaceDialog';

export function WelcomeSection() {
  const { user } = useAuth();
  const router = useRouter();
  const createMeeting = useCreateMeeting();
  
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isWorkspaceDialogOpen, setIsWorkspaceDialogOpen] = useState(false);
  const [isCreatingInstant, setIsCreatingInstant] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleInstantMeeting = async () => {
    if (isCreatingInstant) return;
    
    setIsCreatingInstant(true);
    try {
      const now = new Date();
      const endTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

      const meeting = await createMeeting.mutateAsync({
        title: `${user?.firstName}'s Instant Meeting`,
        startTime: now.toISOString(),
        endTime: endTime.toISOString(),
        meetingType: 'instant',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        participantEmails: [],
      });

      // Navigate to the meeting
      router.push(`/meetings/${meeting.id}`);
    } catch (error) {
      console.error('Failed to create instant meeting:', error);
      alert('Failed to create instant meeting. Please try again.');
    } finally {
      setIsCreatingInstant(false);
    }
  };

  return (
    <>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Greeting */}
          <div>
            <h1 className="text-2xl font-semibold text-[#14213D]">
              {getGreeting()}, {user?.firstName} 👋
            </h1>
            <p className="text-sm text-[#64748B] mt-1">
              Everything you need to bring your team together.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleInstantMeeting}
              disabled={isCreatingInstant}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreatingInstant ? 'Creating...' : 'Start an instant meeting'}
            </button>
            <button
              onClick={() => setIsWorkspaceDialogOpen(true)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Create workspace
            </button>
            <button
              onClick={() => setIsScheduleDialogOpen(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-blue-600 transition-colors"
            >
              Schedule a meeting
            </button>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <ScheduleMeetingDialog
        isOpen={isScheduleDialogOpen}
        onClose={() => setIsScheduleDialogOpen(false)}
      />
      <CreateWorkspaceDialog
        isOpen={isWorkspaceDialogOpen}
        onClose={() => setIsWorkspaceDialogOpen(false)}
      />
    </>
  );
}
