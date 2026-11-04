'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useMeeting } from '@/features/meetings/hooks/use-meetings';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useMeetingSocket } from '@/hooks/use-meeting-socket';
import { 
  Mic, MicOff, Video, VideoOff, Users, MessageSquare, 
  Phone, Share2, Smile, Monitor, Hand, MoreVertical,
  Settings, Copy, Info, X, Send, MonitorOff, Maximize, Minimize,
  Volume2, Subtitles, Layout, HelpCircle, Image, Check
} from 'lucide-react';

// Types
interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
}

interface EmojiReaction {
  id: string;
  emoji: string;
  userId: string;
  userName: string;
  timestamp: number;
  position?: {
    left: number;
    bottom: number;
  };
}

interface ParticipantStatus {
  userId: string;
  isHandRaised: boolean;
  isMuted: boolean;
  isCameraOff: boolean;
}

interface Caption {
  id: string;
  text: string;
  speaker: string;
  timestamp: number;
}

// Emoji options for reactions
const EMOJI_OPTIONS = [
  { emoji: '❤️', label: 'Heart' },
  { emoji: '👍', label: 'Thumbs up' },
  { emoji: '🎉', label: 'Celebration' },
  { emoji: '👏', label: 'Clapping' },
  { emoji: '😂', label: 'Laughing' },
  { emoji: '😮', label: 'Surprised' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '🤔', label: 'Thinking' },
  { emoji: '👎', label: 'Thumbs down' },
];

export default function MeetingRoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const meetingId = params.id as string;
  const { data: meeting, isLoading, error } = useMeeting(meetingId);

  // Get preferences from URL
  const initialCamera = searchParams.get('camera') === 'true';
  const initialMicrophone = searchParams.get('microphone') === 'true';

  // Media states
  const [isCameraOn, setIsCameraOn] = useState(initialCamera);
  const [isMicrophoneOn, setIsMicrophoneOn] = useState(initialMicrophone);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isCaptionsOn, setIsCaptionsOn] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);

  // UI states
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showMeetingInfo, setShowMeetingInfo] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activePanel, setActivePanel] = useState<'chat' | 'participants' | 'info' | null>(null);

  // Chat and reactions
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [reactions, setReactions] = useState<EmojiReaction[]>([]);
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [participantStatuses, setParticipantStatuses] = useState<Map<string, ParticipantStatus>>(new Map());

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenShareRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);

  // Initialize local camera feed
  useEffect(() => {
    let stream: MediaStream | null = null;

    const initializeMedia = async () => {
      if (isCameraOn && videoRef.current) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: isMicrophoneOn,
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error('Error accessing media devices:', err);
          alert('Unable to access camera/microphone. Please check permissions.');
        }
      }
    };

    initializeMedia();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOn, isMicrophoneOn]);

  // Initialize Socket.IO connection
  const {
    isConnected: socketConnected,
    isJoined: socketJoined,
    joinMeeting: socketJoinMeeting,
    leaveMeeting: socketLeaveMeeting,
    sendMessage: socketSendMessage,
    sendReaction: socketSendReaction,
    updateStatus: socketUpdateStatus,
    notifyScreenShareStarted,
    notifyScreenShareStopped,
  } = useMeetingSocket({
    meetingId,
    onMessage: (message) => {
      setChatMessages(prev => [...prev, {
        id: message.id,
        userId: message.userId,
        userName: message.userName,
        message: message.message,
        timestamp: new Date(message.timestamp),
      }]);
    },
    onReaction: (reaction) => {
      setReactions(prev => [...prev, reaction]);
      setTimeout(() => {
        setReactions(prev => prev.filter(r => r.id !== reaction.id));
      }, 3000);
    },
    onStatusUpdate: (update) => {
      setParticipantStatuses(prev => {
        const newMap = new Map(prev);
        const current = newMap.get(update.userId) || {
          userId: update.userId,
          isHandRaised: false,
          isMuted: true,
          isCameraOff: true,
        };
        newMap.set(update.userId, { ...current, ...update });
        return newMap;
      });
    },
    onMeetingState: (state) => {
      // Update participant statuses from server
      const statusMap = new Map<string, ParticipantStatus>();
      state.participants.forEach(p => {
        statusMap.set(p.user.id, {
          userId: p.user.id,
          isHandRaised: p.isHandRaised,
          isMuted: p.isMuted,
          isCameraOff: p.isCameraOff,
        });
      });
      setParticipantStatuses(statusMap);
    },
    onScreenShareStarted: (data) => {
      if (data.userId !== user?.id) {
        // TODO: Show notification that someone is presenting
        console.log(`${data.userName} started presenting`);
      }
    },
    onScreenShareStopped: (data) => {
      if (data.userId !== user?.id) {
        console.log('Presentation stopped');
      }
    },
    onError: (error) => {
      console.error('Socket error:', error);
    },
  });

  // Auto-join meeting when socket connects (only once when ready)
  const hasJoinedRef = useRef(false);
  useEffect(() => {
    if (socketConnected && !socketJoined && meeting && !hasJoinedRef.current) {
      hasJoinedRef.current = true;
      socketJoinMeeting(!isMicrophoneOn, !isCameraOn);
    }
  }, [socketConnected, socketJoined, meeting]);

  // Load chat history on mount
  useEffect(() => {
    if (!meeting) return;
    
    const loadChatHistory = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/meetings/${meetingId}/messages`,
          {
            headers: {
              'Authorization': `Bearer ${document.cookie.split('access_token=')[1]?.split(';')[0]}`,
            },
          }
        );
        
        if (response.ok) {
          const messages = await response.json();
          setChatMessages(messages.map((m: any) => ({
            id: m.id,
            userId: m.userId,
            userName: `${m.user.firstName} ${m.user.lastName}`,
            message: m.message,
            timestamp: new Date(m.createdAt),
          })));
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    };

    loadChatHistory();
  }, [meeting, meetingId]);

  // Auto scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      // Leave meeting on unmount
      socketLeaveMeeting();
    };
  }, [socketLeaveMeeting]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // MODULE 1: Emoji Reactions
  const sendReaction = useCallback((emoji: string) => {
    if (!user) return;

    // Add reaction immediately for instant feedback with unique random position
    const newReaction: EmojiReaction = {
      id: `${Date.now()}-${Math.random()}`,
      emoji,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      timestamp: Date.now(),
      // Store random position so each emoji has a unique placement
      position: {
        left: Math.random() * 70 + 15, // 15% to 85% (avoid edges)
        bottom: Math.random() * 10 + 5, // 5% to 15% (slight vertical variation)
      }
    };
    
    setReactions(prev => [...prev, newReaction]);

    // Send via Socket.IO - it will broadcast to all participants
    socketSendReaction(emoji);

    // Remove reaction after animation completes (2.5s max duration)
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== newReaction.id));
    }, 2600);

    // DON'T close picker - let user spam click multiple emojis!
    // setShowEmojiPicker(false);
  }, [user, socketSendReaction]);

  // MODULE 2: Live Captions
  const toggleCaptions = () => {
    if (!isCaptionsOn) {
      startCaptions();
    } else {
      stopCaptions();
    }
    setIsCaptionsOn(!isCaptionsOn);
  };

  const startCaptions = () => {
    // Check if browser supports Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert('Live captions are not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');

      if (event.results[event.results.length - 1].isFinal) {
        const caption: Caption = {
          id: Date.now().toString(),
          text: transcript,
          speaker: user ? `${user.firstName} ${user.lastName}` : 'You',
          timestamp: Date.now(),
        };

        setCaptions(prev => [...prev.slice(-2), caption]); // Keep last 3 captions
        
        // TODO: Broadcast caption to other participants
        console.log('Caption:', caption);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        alert('Microphone access denied. Please enable microphone permissions for captions.');
        setIsCaptionsOn(false);
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopCaptions = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setCaptions([]);
  };

  // MODULE 3: Screen Sharing
  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' } as any,
          audio: false,
        });

        if (screenShareRef.current) {
          screenShareRef.current.srcObject = stream;
        }

        screenStreamRef.current = stream;
        setIsScreenSharing(true);

        // Notify other participants
        notifyScreenShareStarted();

        // Detect when user stops sharing via browser UI
        stream.getVideoTracks()[0].onended = () => {
          stopScreenShare();
        };

        console.log('Screen sharing started');

      } catch (err: any) {
        if (err.name !== 'NotAllowedError') {
          console.error('Error starting screen share:', err);
          alert('Unable to share screen. Please check permissions.');
        }
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = useCallback(() => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    if (screenShareRef.current) {
      screenShareRef.current.srcObject = null;
    }
    setIsScreenSharing(false);
    
    // Notify other participants
    notifyScreenShareStopped();
    
    console.log('Screen sharing stopped');
  }, [notifyScreenShareStopped]);

  // MODULE 4: Raise Hand
  const toggleRaiseHand = useCallback(() => {
    const newStatus = !isHandRaised;
    setIsHandRaised(newStatus);

    // Update via Socket.IO
    socketUpdateStatus({ isHandRaised: newStatus });

    // Update local participant status
    if (user) {
      const status: ParticipantStatus = {
        userId: user.id,
        isHandRaised: newStatus,
        isMuted: !isMicrophoneOn,
        isCameraOff: !isCameraOn,
      };
      
      setParticipantStatuses(prev => new Map(prev).set(user.id, status));
    }
  }, [isHandRaised, user, isMicrophoneOn, isCameraOn, socketUpdateStatus]);

  // Camera and Microphone controls
  const toggleCamera = useCallback(() => {
    const newState = !isCameraOn;
    setIsCameraOn(newState);
    
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getVideoTracks().forEach(track => {
        track.enabled = newState;
      });
    }

    // Notify via Socket.IO
    socketUpdateStatus({ isCameraOff: !newState });
  }, [isCameraOn, socketUpdateStatus]);

  const toggleMicrophone = useCallback(() => {
    const newState = !isMicrophoneOn;
    setIsMicrophoneOn(newState);
    
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach(track => {
        track.enabled = newState;
      });
    }

    // Notify via Socket.IO
    socketUpdateStatus({ isMuted: !newState });
  }, [isMicrophoneOn, socketUpdateStatus]);

  // MODULE 6: Copy meeting link
  const copyMeetingLink = () => {
    const link = `${window.location.origin}/meetings/${meetingId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // MODULE 7: More Options Menu actions
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await mainContainerRef.current?.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  const togglePictureInPicture = async () => {
    try {
      if (videoRef.current && document.pictureInPictureElement !== videoRef.current) {
        await videoRef.current.requestPictureInPicture();
      } else {
        await document.exitPictureInPicture();
      }
    } catch (err) {
      console.error('Picture-in-Picture error:', err);
      alert('Picture-in-Picture is not supported in your browser.');
    }
  };

  // Chat functions
  const sendMessage = useCallback(() => {
    if (!newMessage.trim() || !user) return;

    // Send via Socket.IO - it will broadcast to all participants
    socketSendMessage(newMessage.trim());
    setNewMessage('');
  }, [newMessage, user, socketSendMessage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  // Leave meeting
  const leaveMeeting = useCallback(() => {
    // Stop all media tracks
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    stopScreenShare();
    stopCaptions();
    
    // Leave via Socket.IO
    socketLeaveMeeting();
    
    router.push('/dashboard');
  }, [stopScreenShare, router, socketLeaveMeeting]);

  // Panel management
  const togglePanel = (panel: 'chat' | 'participants' | 'info') => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  // Enhanced reaction animation based on emoji type
  const getReactionAnimation = (emoji: string) => {
    const animations: Record<string, string> = {
      '❤️': 'animate-heart',
      '👍': 'animate-thumbs-up',
      '🎉': 'animate-celebration',
      '👏': 'animate-clap',
      '😂': 'animate-laugh',
      '😮': 'animate-surprised',
      '😢': 'animate-float-gentle',
      '🤔': 'animate-float-gentle',
      '👎': 'animate-thumbs-down',
    };
    return animations[emoji] || 'animate-float-up';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Joining meeting...</p>
        </div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2">Meeting not found</h2>
          <p className="text-gray-400 mb-6">This meeting may have ended or the link is invalid.</p>
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

  const isHost = meeting.host.id === user?.id;
  const participants = meeting.participants || [];
  const raisedHands = Array.from(participantStatuses.values()).filter(s => s.isHandRaised);

  return (
    <div ref={mainContainerRef} className="min-h-screen bg-gray-900 flex flex-col">
      {/* MODULE 9: Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-white font-semibold text-lg">{meeting.title}</h1>
              <p className="text-gray-400 text-sm">
                {new Date(meeting.startTime).toLocaleTimeString()} - {new Date(meeting.endTime).toLocaleTimeString()}
              </p>
            </div>
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs text-gray-400">
                {socketConnected ? 'Connected' : 'Connecting...'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => togglePanel('info')}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <Info className="w-4 h-4" />
              Meeting Info
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* MODULE 2: Captions Display */}
          {isCaptionsOn && captions.length > 0 && (
            <div className="mb-4 space-y-2">
              {captions.map(caption => (
                <div key={caption.id} className="bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg max-w-3xl mx-auto">
                  <span className="font-semibold">{caption.speaker}: </span>
                  <span>{caption.text}</span>
                </div>
              ))}
            </div>
          )}

          {/* Video Grid */}
          <div className="h-full relative">
            {/* GLOBAL Animated Reactions Overlay - Shows over entire video area */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
              {reactions.map((reaction) => (
                <div
                  key={reaction.id}
                  className={`absolute text-6xl ${getReactionAnimation(reaction.emoji)}`}
                  style={{
                    left: reaction.position ? `${reaction.position.left}%` : `${Math.random() * 80 + 10}%`,
                    bottom: reaction.position ? `${reaction.position.bottom}%` : '10%',
                  }}
                >
                  {reaction.emoji}
                </div>
              ))}
            </div>

            {isScreenSharing ? (
              /* PROFESSIONAL PRESENTATION MODE - Google Meet Style */
              <div className="h-full flex flex-col">
                {/* Main shared screen area */}
                <div className="flex-1 relative bg-black rounded-xl overflow-hidden shadow-2xl">
                  <video
                    ref={screenShareRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  />
                  
                  {/* Presenter info badge */}
                  <div className="absolute top-6 left-6 flex items-center gap-3">
                    <div className="bg-gray-900 bg-opacity-90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-blue-400" />
                      <span className="text-white text-sm font-medium">
                        {user?.firstName} {user?.lastName} is presenting
                      </span>
                    </div>
                    <div className="bg-gray-900 bg-opacity-90 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg">
                      <span className="text-white text-xs font-medium flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {participants.length + 1}
                      </span>
                    </div>
                  </div>

                  {/* Stop presenting button for presenter */}
                  <div className="absolute top-6 right-6">
                    <button
                      onClick={toggleScreenShare}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 font-medium"
                    >
                      <MonitorOff className="w-4 h-4" />
                      Stop presenting
                    </button>
                  </div>
                  
                  {/* Animated Reactions Overlay */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {reactions.map((reaction) => (
                      <div
                        key={reaction.id}
                        className={`absolute text-5xl ${getReactionAnimation(reaction.emoji)}`}
                        style={{
                          left: `${Math.random() * 85 + 5}%`,
                          bottom: '10%',
                        }}
                      >
                        {reaction.emoji}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating presenter tile - Bottom right */}
                <div className="absolute bottom-24 right-6 w-64 h-48 z-20">
                  <div className="relative bg-gray-800 rounded-xl overflow-hidden w-full h-full shadow-2xl border-2 border-gray-700">
                    {isCameraOn ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                        <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </div>
                      </div>
                    )}
                    
                    {/* Presenter name overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                      <p className="text-white text-sm font-medium truncate">
                        {user?.firstName} {user?.lastName}
                      </p>
                    </div>
                    
                    {/* Microphone status */}
                    {!isMicrophoneOn && (
                      <div className="absolute top-2 right-2 bg-red-600 p-1.5 rounded-full shadow-lg">
                        <MicOff className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Normal Grid View */
              <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Local Video */}
                <div className="relative bg-gray-800 rounded-xl overflow-hidden aspect-video shadow-xl">
                  {isCameraOn ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                      <div className="text-center">
                        <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold mb-3 mx-auto shadow-lg">
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </div>
                        <p className="text-white font-medium">{user?.firstName} {user?.lastName} (You)</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Enhanced Animated Reactions */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {reactions.map((reaction) => (
                      <div
                        key={reaction.id}
                        className={`absolute text-5xl ${getReactionAnimation(reaction.emoji)}`}
                        style={{
                          left: `${Math.random() * 80 + 10}%`,
                          bottom: '15%',
                        }}
                      >
                        {reaction.emoji}
                      </div>
                    ))}
                  </div>

                  <div className="absolute bottom-4 left-4 bg-gray-900 bg-opacity-80 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg">
                    <p className="text-white text-sm font-medium">{user?.firstName} {user?.lastName} (You)</p>
                  </div>
                  
                  {/* MODULE 4: Hand Raised Indicator */}
                  {isHandRaised && (
                    <div className="absolute top-4 left-4 bg-yellow-500 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-lg animate-pulse">
                      <Hand className="w-4 h-4 text-white" />
                      <span className="text-white text-sm font-medium">Hand raised</span>
                    </div>
                  )}
                  
                  {!isMicrophoneOn && (
                    <div className="absolute top-4 right-4 bg-red-600 p-2 rounded-lg shadow-lg">
                      <MicOff className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>

                {/* Placeholder for other participants */}
                <div className="relative bg-gray-800 rounded-xl overflow-hidden aspect-video flex items-center justify-center shadow-xl">
                  <div className="text-center text-gray-400">
                    <Users className="w-16 h-16 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Waiting for others to join...</p>
                    <p className="text-xs mt-2 text-gray-500">
                      Note: Multi-user video requires WebRTC provider (Daily.co, Twilio, Agora)
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MODULE 8: Side Panels */}
        {activePanel && (
          <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
            {/* Panel Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-white font-semibold flex items-center gap-2">
                {activePanel === 'chat' && <><MessageSquare className="w-5 h-5" />Meeting Chat</>}
                {activePanel === 'participants' && <><Users className="w-5 h-5" />Participants ({participants.length + 1})</>}
                {activePanel === 'info' && <><Info className="w-5 h-5" />Meeting Details</>}
              </h3>
              <button
                onClick={() => setActivePanel(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Panel */}
            {activePanel === 'chat' && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatMessages.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No messages yet</p>
                      <p className="text-xs mt-1">Send a message to start the conversation</p>
                    </div>
                  ) : (
                    chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${
                          msg.userId === user?.id ? 'items-end' : 'items-start'
                        }`}
                      >
                        <div className={`max-w-[80%] rounded-lg p-3 ${
                          msg.userId === user?.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-white'
                        }`}>
                          {msg.userId !== user?.id && (
                            <p className="text-xs font-semibold mb-1 opacity-75">{msg.userName}</p>
                          )}
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div className="p-4 border-t border-gray-700">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Send message"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Press Enter to send
                  </p>
                </div>
              </>
            )}

            {/* Participants Panel */}
            {activePanel === 'participants' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {raisedHands.length > 0 && (
                  <div className="mb-4">
                    <p className="text-yellow-500 text-xs font-semibold mb-2 flex items-center gap-1">
                      <Hand className="w-4 h-4" />
                      RAISED HANDS ({raisedHands.length})
                    </p>
                  </div>
                )}
                
                {/* Host */}
                <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold relative">
                    {meeting.host.firstName?.[0]}{meeting.host.lastName?.[0]}
                    {isHost && isHandRaised && (
                      <Hand className="absolute -top-1 -right-1 w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">
                      {meeting.host.firstName} {meeting.host.lastName}
                      {isHost && ' (You)'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-blue-400 text-xs">Host</span>
                      {isHost && !isMicrophoneOn && (
                        <MicOff className="w-3 h-3 text-red-400" />
                      )}
                      {isHost && !isCameraOn && (
                        <VideoOff className="w-3 h-3 text-red-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Other Participants */}
                {participants.map((participant: any) => (
                  <div key={participant.id} className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold">
                      {participant.user.firstName?.[0]}{participant.user.lastName?.[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">
                        {participant.user.firstName} {participant.user.lastName}
                      </p>
                      <p className="text-gray-400 text-xs capitalize">{participant.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Meeting Info Panel */}
            {activePanel === 'info' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <label className="text-gray-400 text-xs font-semibold block mb-1">MEETING TITLE</label>
                  <p className="text-white">{meeting.title}</p>
                </div>
                
                <div>
                  <label className="text-gray-400 text-xs font-semibold block mb-1">MEETING ID</label>
                  <p className="text-white font-mono">{meetingId}</p>
                </div>

                <div>
                  <label className="text-gray-400 text-xs font-semibold block mb-1">MEETING LINK</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={`${window.location.origin}/meetings/${meetingId}`}
                      readOnly
                      className="flex-1 bg-gray-700 text-white text-sm px-3 py-2 rounded border border-gray-600"
                    />
                    <button
                      onClick={copyMeetingLink}
                      className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      title="Copy link"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 text-xs font-semibold block mb-1">SCHEDULED TIME</label>
                  <p className="text-white">
                    {new Date(meeting.startTime).toLocaleString()} - {new Date(meeting.endTime).toLocaleTimeString()}
                  </p>
                </div>

                {meeting.description && (
                  <div>
                    <label className="text-gray-400 text-xs font-semibold block mb-1">DESCRIPTION</label>
                    <p className="text-white text-sm">{meeting.description}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODULE 5: Enhanced Controls */}
      <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
        <div className="flex flex-col items-center gap-3">
          {/* MODULE 1: Enhanced Professional Emoji Picker */}
          {showEmojiPicker && (
            <div className="bg-gray-800/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-2xl border border-gray-600/50">
              <div className="flex gap-2">
                {EMOJI_OPTIONS.map(({ emoji, label }) => (
                  <button
                    key={emoji}
                    onClick={() => sendReaction(emoji)}
                    className="group relative w-12 h-12 flex items-center justify-center text-2xl rounded-full bg-gray-700/50 hover:bg-gray-600/70 active:scale-95 transition-all duration-200 hover:scale-110"
                    title={label}
                  >
                    <span className="group-hover:scale-125 transition-transform duration-200">
                      {emoji}
                    </span>
                    {/* Tooltip */}
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Main Controls */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {/* Microphone */}
            <button
              onClick={toggleMicrophone}
              className={`p-4 rounded-full transition-colors ${
                isMicrophoneOn
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
              title={isMicrophoneOn ? 'Mute microphone' : 'Unmute microphone'}
            >
              {isMicrophoneOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </button>

            {/* Camera */}
            <button
              onClick={toggleCamera}
              className={`p-4 rounded-full transition-colors ${
                isCameraOn
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
              title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
            >
              {isCameraOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </button>

            {/* Screen Share */}
            <button
              onClick={toggleScreenShare}
              className={`p-4 rounded-full transition-colors ${
                isScreenSharing
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
              title={isScreenSharing ? 'Stop presenting' : 'Present now'}
            >
              {isScreenSharing ? <MonitorOff className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
            </button>

            {/* Reactions */}
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`p-4 rounded-full transition-colors ${
                showEmojiPicker ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              } text-white`}
              title="Send reaction"
            >
              <Smile className="w-6 h-6" />
            </button>

            {/* Captions */}
            <button
              onClick={toggleCaptions}
              className={`p-4 rounded-full transition-colors ${
                isCaptionsOn ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              } text-white`}
              title="Toggle captions"
            >
              <Subtitles className="w-6 h-6" />
            </button>

            {/* Raise Hand */}
            <button
              onClick={toggleRaiseHand}
              className={`p-4 rounded-full transition-colors ${
                isHandRaised ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-700 hover:bg-gray-600'
              } text-white`}
              title={isHandRaised ? 'Lower hand' : 'Raise hand'}
            >
              <Hand className="w-6 h-6" />
            </button>

            {/* Participants */}
            <button
              onClick={() => togglePanel('participants')}
              className={`p-4 rounded-full transition-colors ${
                activePanel === 'participants' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              } text-white relative`}
              title="Toggle participants"
            >
              <Users className="w-6 h-6" />
              {raisedHands.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {raisedHands.length}
                </span>
              )}
            </button>

            {/* Chat */}
            <button
              onClick={() => togglePanel('chat')}
              className={`p-4 rounded-full transition-colors ${
                activePanel === 'chat' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              } text-white relative`}
              title="Toggle chat"
            >
              <MessageSquare className="w-6 h-6" />
              {chatMessages.length > 0 && activePanel !== 'chat' && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {chatMessages.length}
                </span>
              )}
            </button>

            {/* More Options */}
            <div className="relative">
              <button
                onClick={() => setShowMoreOptions(!showMoreOptions)}
                className={`p-4 rounded-full transition-colors ${
                  showMoreOptions ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                } text-white`}
                title="More options"
              >
                <MoreVertical className="w-6 h-6" />
              </button>

              {/* MODULE 7: More Options Menu */}
              {showMoreOptions && (
                <div className="absolute bottom-full right-0 mb-2 bg-gray-700 rounded-lg shadow-xl py-2 min-w-[200px]">
                  <button
                    onClick={() => {
                      togglePanel('info');
                      setShowMoreOptions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-white hover:bg-gray-600 flex items-center gap-3"
                  >
                    <Info className="w-4 h-4" />
                    Meeting details
                  </button>
                  <button
                    onClick={() => {
                      toggleFullscreen();
                      setShowMoreOptions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-white hover:bg-gray-600 flex items-center gap-3"
                  >
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                    {isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                  </button>
                  <button
                    onClick={() => {
                      togglePictureInPicture();
                      setShowMoreOptions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-white hover:bg-gray-600 flex items-center gap-3"
                  >
                    <Layout className="w-4 h-4" />
                    Picture-in-picture
                  </button>
                  <div className="border-t border-gray-600 my-1"></div>
                  <button
                    className="w-full px-4 py-2 text-left text-gray-400 hover:bg-gray-600 flex items-center gap-3 cursor-not-allowed"
                    disabled
                    title="Coming soon"
                  >
                    <Image className="w-4 h-4" />
                    Backgrounds & effects
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left text-white hover:bg-gray-600 flex items-center gap-3"
                    onClick={() => setShowMoreOptions(false)}
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left text-white hover:bg-gray-600 flex items-center gap-3"
                    onClick={() => setShowMoreOptions(false)}
                  >
                    <HelpCircle className="w-4 h-4" />
                    Help & troubleshooting
                  </button>
                </div>
              )}
            </div>

            {/* Leave Meeting */}
            <button
              onClick={leaveMeeting}
              className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors ml-4"
              title="Leave meeting"
            >
              <Phone className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Professional CSS Animations for Emoji Reactions */}
      <style jsx global>{`
        /* Heart - Scale + Rotate + Float */
        @keyframes animate-heart {
          0% {
            transform: translateY(0) scale(0.8) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          30% {
            transform: translateY(-60px) scale(1.2) rotate(15deg);
          }
          60% {
            transform: translateY(-180px) scale(1.4) rotate(-10deg);
          }
          100% {
            transform: translateY(-320px) scale(1.6) rotate(5deg);
            opacity: 0;
          }
        }

        /* Thumbs Up - Quick Scale + Float */
        @keyframes animate-thumbs-up {
          0% {
            transform: translateY(0) scale(0.5);
            opacity: 0;
          }
          15% {
            transform: translateY(-20px) scale(1.3);
            opacity: 1;
          }
          30% {
            transform: translateY(-60px) scale(1.1);
          }
          100% {
            transform: translateY(-300px) scale(1.5);
            opacity: 0;
          }
        }

        /* Celebration - Pop + Confetti Particles + Float */
        @keyframes animate-celebration {
          0% {
            transform: translateY(0) scale(0.3) rotate(0deg);
            opacity: 0;
            filter: brightness(1);
          }
          10% {
            transform: translateY(-10px) scale(1.4) rotate(180deg);
            opacity: 1;
            filter: brightness(1.5);
          }
          20% {
            transform: translateY(-30px) scale(1.2) rotate(360deg);
            filter: brightness(1.3);
          }
          40% {
            transform: translateY(-100px) scale(1.3) rotate(540deg);
          }
          100% {
            transform: translateY(-320px) scale(1.6) rotate(720deg);
            opacity: 0;
            filter: brightness(1);
          }
        }

        /* Clap - 2-3 Pulses + Float */
        @keyframes animate-clap {
          0% {
            transform: translateY(0) scale(0.8);
            opacity: 0;
          }
          8% {
            transform: translateY(-10px) scale(1.2);
            opacity: 1;
          }
          16% {
            transform: translateY(-20px) scale(1);
          }
          24% {
            transform: translateY(-30px) scale(1.2);
          }
          32% {
            transform: translateY(-50px) scale(1);
          }
          40% {
            transform: translateY(-80px) scale(1.15);
          }
          100% {
            transform: translateY(-300px) scale(1.4);
            opacity: 0;
          }
        }

        /* Laugh - Bounce + Horizontal Wiggle + Float */
        @keyframes animate-laugh {
          0% {
            transform: translate(0, 0) scale(0.8) rotate(0deg);
            opacity: 0;
          }
          10% {
            transform: translate(-8px, -30px) scale(1.2) rotate(-5deg);
            opacity: 1;
          }
          20% {
            transform: translate(8px, -50px) scale(1.1) rotate(5deg);
          }
          30% {
            transform: translate(-6px, -80px) scale(1.2) rotate(-4deg);
          }
          40% {
            transform: translate(6px, -110px) scale(1.1) rotate(4deg);
          }
          50% {
            transform: translate(-4px, -140px) scale(1.15) rotate(-3deg);
          }
          60% {
            transform: translate(4px, -170px) scale(1.1) rotate(3deg);
          }
          100% {
            transform: translate(0, -310px) scale(1.4) rotate(0deg);
            opacity: 0;
          }
        }

        /* Surprised - Pop + Scale Bounce */
        @keyframes animate-surprised {
          0% {
            transform: translateY(0) scale(0.5);
            opacity: 0;
          }
          15% {
            transform: translateY(-30px) scale(1.5);
            opacity: 1;
          }
          25% {
            transform: translateY(-50px) scale(1.2);
          }
          35% {
            transform: translateY(-80px) scale(1.4);
          }
          45% {
            transform: translateY(-110px) scale(1.25);
          }
          100% {
            transform: translateY(-300px) scale(1.5);
            opacity: 0;
          }
        }

        /* Float Gentle - Simple Float (for sad/thinking) */
        @keyframes animate-float-gentle {
          0% {
            transform: translateY(0) scale(0.9);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translateY(-300px) scale(1.3);
            opacity: 0;
          }
        }

        /* Thumbs Down - Scale + Float */
        @keyframes animate-thumbs-down {
          0% {
            transform: translateY(0) scale(0.8);
            opacity: 0;
          }
          15% {
            transform: translateY(-20px) scale(1.2);
            opacity: 1;
          }
          100% {
            transform: translateY(-300px) scale(1.4);
            opacity: 0;
          }
        }

        /* Apply animations based on emoji type */
        .animate-heart {
          animation: animate-heart 2.5s ease-out forwards;
        }

        .animate-thumbs-up {
          animation: animate-thumbs-up 2s ease-out forwards;
        }

        .animate-celebration {
          animation: animate-celebration 2.5s ease-out forwards;
        }

        .animate-clap {
          animation: animate-clap 2.2s ease-out forwards;
        }

        .animate-laugh {
          animation: animate-laugh 2.5s ease-out forwards;
        }

        .animate-surprised {
          animation: animate-surprised 2s ease-out forwards;
        }

        .animate-float-gentle {
          animation: animate-float-gentle 2.5s ease-out forwards;
        }

        .animate-thumbs-down {
          animation: animate-thumbs-down 2s ease-out forwards;
        }

        /* Respect prefers-reduced-motion */
        @media (prefers-reduced-motion: reduce) {
          .animate-heart,
          .animate-thumbs-up,
          .animate-celebration,
          .animate-clap,
          .animate-laugh,
          .animate-surprised,
          .animate-float-gentle,
          .animate-thumbs-down {
            animation: none;
            opacity: 0.7;
            transition: opacity 0.5s ease-out;
          }
        }
      `}</style>
    </div>
  );
}
