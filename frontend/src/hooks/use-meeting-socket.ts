import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
}

interface EmojiReaction {
  id: string;
  emoji: string;
  userId: string;
  userName: string;
  timestamp: number;
}

interface ParticipantStatus {
  userId: string;
  isHandRaised: boolean;
  isMuted: boolean;
  isCameraOff: boolean;
}

interface MeetingState {
  participants: Array<{
    user: {
      id: string;
      firstName: string;
      lastName: string;
      profileImage?: string;
    };
    isHandRaised: boolean;
    isMuted: boolean;
    isCameraOff: boolean;
  }>;
  activeParticipantCount: number;
}

interface UseMeetingSocketOptions {
  meetingId: string;
  onMessage?: (message: ChatMessage) => void;
  onReaction?: (reaction: EmojiReaction) => void;
  onStatusUpdate?: (update: { userId: string } & Partial<ParticipantStatus>) => void;
  onParticipantJoined?: (data: any) => void;
  onParticipantLeft?: (data: { userId: string }) => void;
  onMeetingState?: (state: MeetingState) => void;
  onScreenShareStarted?: (data: { userId: string; userName: string }) => void;
  onScreenShareStopped?: (data: { userId: string }) => void;
  onError?: (error: { message: string }) => void;
}

export function useMeetingSocket(options: UseMeetingSocketOptions) {
  const {
    meetingId,
    onMessage,
    onReaction,
    onStatusUpdate,
    onParticipantJoined,
    onParticipantLeft,
    onMeetingState,
    onScreenShareStarted,
    onScreenShareStopped,
    onError,
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isJoined, setIsJoined] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    const token = Cookies.get('access_token');
    if (!token || !meetingId) return;

    const socket = io(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/meetings`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // Connection handlers
    socket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
      setIsJoined(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    // Meeting event handlers
    socket.on('meeting-state', (state: MeetingState) => {
      console.log('Meeting state received:', state);
      onMeetingState?.(state);
    });

    socket.on('participant-joined', (data) => {
      console.log('Participant joined:', data);
      onParticipantJoined?.(data);
    });

    socket.on('participant-left', (data) => {
      console.log('Participant left:', data);
      onParticipantLeft?.(data);
    });

    socket.on('message-received', (message: ChatMessage) => {
      console.log('Message received:', message);
      onMessage?.(message);
    });

    socket.on('reaction-received', (reaction: EmojiReaction) => {
      console.log('Reaction received:', reaction);
      onReaction?.(reaction);
    });

    socket.on('status-updated', (update) => {
      console.log('Status updated:', update);
      onStatusUpdate?.(update);
    });

    socket.on('screen-share-started', (data) => {
      console.log('Screen share started:', data);
      onScreenShareStarted?.(data);
    });

    socket.on('screen-share-stopped', (data) => {
      console.log('Screen share stopped:', data);
      onScreenShareStopped?.(data);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
      onError?.(error);
    });

    // Cleanup
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // Only depend on meetingId - callbacks are handled by closure
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId]);

  // Join meeting
  const joinMeeting = useCallback((isMuted = true, isCameraOff = true) => {
    if (!socketRef.current || !isConnected) {
      console.warn('Socket not connected, cannot join meeting');
      return;
    }

    socketRef.current.emit('join-meeting', {
      meetingId,
      isMuted,
      isCameraOff,
    });

    setIsJoined(true);
    console.log('Joining meeting:', meetingId);
  }, [meetingId, isConnected]);

  // Leave meeting
  const leaveMeeting = useCallback(() => {
    if (!socketRef.current) return;

    socketRef.current.emit('leave-meeting');
    setIsJoined(false);
    console.log('Leaving meeting');
  }, []);

  // Send message
  const sendMessage = useCallback((message: string) => {
    if (!socketRef.current || !isJoined) {
      console.warn('Not joined to meeting, cannot send message');
      return;
    }

    socketRef.current.emit('send-message', { message });
    console.log('Sending message:', message);
  }, [isJoined]);

  // Send reaction
  const sendReaction = useCallback((emoji: string) => {
    if (!socketRef.current || !isJoined) {
      console.warn('Not joined to meeting, cannot send reaction');
      return;
    }

    socketRef.current.emit('send-reaction', { emoji });
    console.log('Sending reaction:', emoji);
  }, [isJoined]);

  // Update status
  const updateStatus = useCallback((status: Partial<ParticipantStatus>) => {
    if (!socketRef.current || !isJoined) {
      console.warn('Not joined to meeting, cannot update status');
      return;
    }

    socketRef.current.emit('update-status', status);
    console.log('Updating status:', status);
  }, [isJoined]);

  // Notify screen share started
  const notifyScreenShareStarted = useCallback(() => {
    if (!socketRef.current || !isJoined) return;
    socketRef.current.emit('screen-share-started');
  }, [isJoined]);

  // Notify screen share stopped
  const notifyScreenShareStopped = useCallback(() => {
    if (!socketRef.current || !isJoined) return;
    socketRef.current.emit('screen-share-stopped');
  }, [isJoined]);

  return {
    isConnected,
    isJoined,
    joinMeeting,
    leaveMeeting,
    sendMessage,
    sendReaction,
    updateStatus,
    notifyScreenShareStarted,
    notifyScreenShareStopped,
  };
}
