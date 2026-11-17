'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMeeting } from '@/features/meetings/hooks/use-meetings';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { 
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  useToken,
} from '@livekit/components-react';
import '@livekit/components-styles';

export default function MeetingRoomWithLiveKit() {
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
  
  const { data: meeting, isLoading, error } = useMeeting(actualMeetingId || '');

  // Join personal room on mount
  useEffect(() => {
    if (!isPersonalRoom || !isJoiningPersonalRoom || !user) return;

    const joinRoom = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/meetings/personal/${meetingId}/join`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${document.cookie.split('access_token=')[1]?.split(';')[0]}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to join personal room');
        }

        const meeting = await response.json();
        setActualMeetingId(meeting.id);
        setIsJoiningPersonalRoom(false);
      } catch (error) {
        console.error('Error joining personal room:', error);
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
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/meetings/${actualMeetingId}/livekit-token`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${document.cookie.split('access_token=')[1]?.split(';')[0]}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to get LiveKit token');
        }

        const data = await response.json();
        setLivekitToken(data.token);
        setLivekitUrl(data.livekitUrl);
      } catch (error) {
        console.error('Error getting LiveKit token:', error);
      }
    };

    getToken();
  }, [actualMeetingId, user]);

  // Leave meeting handler
  const handleDisconnect = () => {
    router.push('/dashboard');
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
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Connecting to meeting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <LiveKitRoom
        token={livekitToken}
        serverUrl={livekitUrl}
        connect={true}
        onDisconnected={handleDisconnect}
        audio={true}
        video={true}
        style={{ height: '100vh' }}
      >
        <VideoConference />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}
