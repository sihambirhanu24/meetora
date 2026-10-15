'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useCancelMeeting, useUpdateParticipantStatus } from '@/features/meetings/hooks/use-meetings';
import type { Meeting, PendingInvite } from '@/features/meetings/types';

interface MeetingCardProps {
  meeting: Meeting;
  isPending?: boolean;
  pendingInvite?: PendingInvite;
}

export function MeetingCard({ meeting, isPending, pendingInvite }: MeetingCardProps) {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const cancelMeeting = useCancelMeeting();
  const updateStatus = useUpdateParticipantStatus();

  const isHost = meeting.hostId === user?.id;
  const isCancelled = meeting.status === 'cancelled';
  const isCompleted = meeting.status === 'completed';

  const formatTime = (date: string) => {
    return format(new Date(date), 'h:mm a');
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'MMM d, yyyy');
  };

  const handleAccept = () => {
    if (pendingInvite) {
      updateStatus.mutate({
        id: meeting.id,
        data: { status: 'accepted' },
      });
    }
  };

  const handleDecline = () => {
    if (pendingInvite) {
      updateStatus.mutate({
        id: meeting.id,
        data: { status: 'declined' },
      });
    }
  };

  const handleCancel = () => {
    cancelMeeting.mutate(meeting.id, {
      onSuccess: () => setShowCancelDialog(false),
    });
  };

  const handleShare = () => {
    if (meeting.meetingLink) {
      navigator.clipboard.writeText(meeting.meetingLink);
      alert('Meeting link copied to clipboard!');
    }
  };

  const getStatusBadge = () => {
    if (isCancelled) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">
          Cancelled
        </span>
      );
    }
    if (isCompleted) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded">
          Completed
        </span>
      );
    }
    if (meeting.status === 'in_progress') {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          In Progress
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
        Scheduled
      </span>
    );
  };

  const acceptedParticipants = meeting.participants.filter(p => p.status === 'accepted');
  const participantCount = acceptedParticipants.length + 1; // +1 for host

  return (
    <>
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 hover:shadow-sm transition-shadow">
        <div className="flex items-start gap-4">
          {/* Time Badge */}
          <div className="flex-shrink-0 text-center">
            <div className="w-16 h-16 rounded-lg bg-slate-50 border border-[#E2E8F0] flex flex-col items-center justify-center">
              <span className="text-xs font-medium text-[#64748B]">
                {formatTime(meeting.startTime)}
              </span>
              <span className="text-xs text-[#64748B] mt-0.5">
                {meeting.timezone}
              </span>
            </div>
          </div>

          {/* Meeting Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold text-[#14213D] truncate">
                    {meeting.title}
                  </h3>
                  {getStatusBadge()}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-[#64748B] mb-2">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(meeting.startTime)}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-[#64748B]">
                    Host: {meeting.host.firstName} {meeting.host.lastName}
                  </span>
                  <span className="text-sm text-[#64748B]">•</span>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="text-sm text-[#64748B]">{participantCount} participants</span>
                  </div>
                </div>

                {meeting.description && (
                  <p className="text-sm text-[#64748B] mt-2 line-clamp-2">
                    {meeting.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {isPending ? (
                  <>
                    <button
                      onClick={handleAccept}
                      disabled={updateStatus.isPending}
                      className="px-4 py-2 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                      Accept
                    </button>
                    <button
                      onClick={handleDecline}
                      disabled={updateStatus.isPending}
                      className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                      Decline
                    </button>
                  </>
                ) : !isCancelled && !isCompleted && (
                  <>
                    <button
                      onClick={() => window.open(meeting.meetingLink, '_blank')}
                      className="px-4 py-2 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Join
                    </button>
                    <button
                      onClick={handleShare}
                      className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Share"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                    {isHost && (
                      <div className="relative">
                        <button
                          onClick={() => setShowMenu(!showMenu)}
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                        {showMenu && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-[#E2E8F0] py-1 z-10">
                            <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                              Edit Meeting
                            </button>
                            <button
                              onClick={() => {
                                setShowMenu(false);
                                setShowCancelDialog(true);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              Cancel Meeting
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-[#14213D] mb-2">Cancel Meeting</h3>
            <p className="text-sm text-[#64748B] mb-6">
              Are you sure you want to cancel this meeting? This action cannot be undone and all participants will be notified.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCancelDialog(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Keep Meeting
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelMeeting.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {cancelMeeting.isPending ? 'Cancelling...' : 'Cancel Meeting'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
