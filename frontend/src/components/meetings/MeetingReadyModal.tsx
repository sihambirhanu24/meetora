'use client';

import { useState } from 'react';
import { X, Copy, Check, Users, Link as LinkIcon } from 'lucide-react';

interface MeetingReadyModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetingTitle: string;
  meetingId: string;
  meetingLink: string;
  onAddOthers?: () => void;
  onJoinNow?: () => void;
}

export function MeetingReadyModal({
  isOpen,
  onClose,
  meetingTitle,
  meetingId,
  meetingLink,
  onAddOthers,
  onJoinNow,
}: MeetingReadyModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(meetingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">Your meeting is ready</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Meeting Info */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">{meetingTitle}</h3>
            <p className="text-sm text-gray-500">Meeting ID: {meetingId}</p>
          </div>

          {/* Add Others Button */}
          {onAddOthers && (
            <button
              onClick={onAddOthers}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Users className="w-5 h-5" />
              Add others
            </button>
          )}

          {/* Meeting Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting link
            </label>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                <LinkIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  value={meetingLink}
                  readOnly
                  className="flex-1 bg-transparent text-sm text-gray-700 focus:outline-none"
                />
              </div>
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-2"
                title="Copy link"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span className="text-sm font-medium">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Access Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Anyone with the link can join</strong>
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Share this link with people you want to invite to the meeting.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3">
          {onJoinNow && (
            <button
              onClick={onJoinNow}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Join Now
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            {onJoinNow ? 'Later' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
