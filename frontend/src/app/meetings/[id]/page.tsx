'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMeeting } from '@/features/meetings/hooks/use-meetings';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { 
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react';
import '@livekit/components-styles';

export default function MeetingRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const meetingId = params.id as string;
  const isPersonalRoom = meetingId.startsWith('personal-');
  
  // For personal rooms, we need to join/create the meeting first
  const [actualMeetingId, setActualMeetingId] = useState<string | null>(
    isPersonalRoom ? null : meetingId
  );
  const [isJoiningPersonalRoom, setIsJoiningPersonalRoom] = useState(isPersonalRoom);
  const [livekitToken, setLivekitToken] = useState<string>('');
  const [livekitUrl, setLivekitUrl] = useState<string>('');
  const [tokenError, setTokenError] = useState<string>('');
  
  const { data: meeting, isLoading, error } = useMeeting(actualMeetingId || '');

  // Join personal room on mount
  useEffect(() => {
    if (!isPersonalRoom || !isJoiningPersonalRoom || !user) return;

    const joinRoom = async () => {
      try {
        const token = document.cookie.split('access_token=')[1]?.split(';')[0];
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/meetings/personal/${meetingId}/join`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to join personal room');
        }

        const meeting = await response.json();
        console.log('Personal room joined:', meeting);
        setActualMeetingId(meeting.id);
        setIsJoiningPersonalRoom(false);
      } catch (error: any) {
        console.error('Error joining personal room:', error);
        setTokenError(error.message);
        setIsJoiningPersonalRoom(false);
      }
    };

    joinRoom();
  }, [isPersonalRoom, isJoiningPersonalRoom, meetingId, user]);

  // Get LiveKit token once we have the meeting ID
  useEffect(() => {
    if (!actualMeetingId || !user) return;

    const getToken = async () => {
      try {
        const token = document.cookie.split('access_token=')[1]?.split(';')[0];
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/meetings/${actualMeetingId}/livekit-token`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to get LiveKit token');
        }

        const data = await response.json();
        console.log('LiveKit token received');
        setLivekitToken(data.token);
        setLivekitUrl(data.livekitUrl);
      } catch (error: any) {
        console.error('Error getting LiveKit token:', error);
        setTokenError(error.message);
      }
    };

    getToken();
  }, [actualMeetingId, user]);

  // Leave meeting handler
  const handleDisconnect = () => {
    console.log('Disconnected from meeting');
    router.push('/dashboard');
  };

  const handleError = (error: Error) => {
    console.error('LiveKit error:', error);
    setTokenError(error.message);
  };

  if (isLoading || isJoiningPersonalRoom) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">
            {isJoiningPersonalRoom ? 'Joining personal room...' : 'Joining meeting...'}
          </p>
        </div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2">Meeting not found</h2>
          <p className="text-gray-400 mb-6">
            This meeting may have ended or the link is invalid.
          </p>
          {tokenError && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6 text-left">
              <p className="text-red-400 text-sm font-mono">{tokenError}</p>
            </div>
          )}
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!livekitToken || !livekitUrl) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg mb-4">Connecting to meeting...</p>
          {tokenError && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-left">
              <p className="text-red-400 text-sm mb-2">Connection Error:</p>
              <p className="text-red-300 text-xs font-mono">{tokenError}</p>
              <button
                onClick={() => router.push('/dashboard')}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Return to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Meeting Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-3 z-10 relative">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-semibold text-lg">{meeting.title}</h1>
            <p className="text-gray-400 text-sm">
              {new Date(meeting.startTime).toLocaleString()}
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Leave Meeting
          </button>
        </div>
      </div>

      {/* LiveKit Video Conference */}
      <div style={{ height: 'calc(100vh - 72px)' }}>
        <LiveKitRoom
          token={livekitToken}
          serverUrl={livekitUrl}
          connect={true}
          onDisconnected={handleDisconnect}
          onError={handleError}
          audio={true}
          video={true}
          style={{ height: '100%' }}
        >
          <VideoConference />
          <RoomAudioRenderer />
        </LiveKitRoom>
      </div>
    </div>
  );
}
