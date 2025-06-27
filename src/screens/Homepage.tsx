import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/FileUpload';
import { FileManager } from '@/components/FileManager';
import { JargonGuide } from '@/components/JargonGuide';
import { useAtom } from 'jotai';
import { screenAtom } from '@/store/screens';
import { useAuth } from '@/hooks/useAuth';
import { useUserFiles } from '@/hooks/useUserFiles';
import { conversationAtom } from '@/store/conversation';
import { createConversation } from '@/api';
import { apiTokenAtom } from '@/store/tokens';
import Video from '@/components/Video';
import { 
  Video as VideoIcon, 
  Files, 
  BookOpen, 
  TrendingUp, 
  Shield, 
  Target,
  ArrowRight,
  Upload,
  MessageCircle,
  BarChart3,
  User,
  CheckCircle,
  Zap,
  Users,
  DollarSign,
  PieChart,
  Wallet,
  Settings,
  FileText,
  History,
  Brain,
  ChevronRight,
  X,
  Camera,
  Mic,
  AlertTriangle,
  MicIcon,
  MicOffIcon,
  VideoOffIcon,
  PhoneIcon,
  Send,
  LogOut,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  DailyAudio,
  useDaily,
  useLocalSessionId,
  useParticipantIds,
  useVideoTrack,
  useAudioTrack,
  useDevices,
} from "@daily-co/daily-react";
import { quantum } from 'ldrs';
import zoomSound from "@/assets/sounds/zoom.mp3";

quantum.register();

type DashboardSection = 'uploaded-documents' | 'reports' | 'chat-history' | 'knowledge-base' | 'settings' | null;
type VideoState = 'none' | 'requesting-access' | 'starting-conversation' | 'active-conversation';

export const Homepage: React.FC = () => {
  const [, setScreenState] = useAtom(screenAtom);
  const [activeSection, setActiveSection] = useState<DashboardSection>(null);
  const [videoState, setVideoState] = useState<VideoState>('none');
  const [conversation, setConversation] = useAtom(conversationAtom);
  const [token, setToken] = useAtom(apiTokenAtom);
  const [hasMediaAccess, setHasMediaAccess] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [start, setStart] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const { user, signOut } = useAuth();
  const { files, getFileCount } = useUserFiles();

  // Daily.co hooks
  const daily = useDaily();
  const { currentMic, setMicrophone, setSpeaker } = useDevices();
  const localSessionId = useLocalSessionId();
  const localVideo = useVideoTrack(localSessionId);
  const localAudio = useAudioTrack(localSessionId);
  const isCameraEnabled = !localVideo.isOff;
  const isMicEnabled = !localAudio.isOff;
  const remoteParticipantIds = useParticipantIds({ filter: "remote" });

  const audio = useMemo(() => {
    const audioObj = new Audio(zoomSound);
    audioObj.volume = 0.7;
    return audioObj;
  }, []);

  // Set the API key automatically
  React.useEffect(() => {
    if (!token) {
      const apiKey = "f840d8e47ab44f0d85e8ca21f24275a8";
      setToken(apiKey);
      localStorage.setItem('tavus-token', apiKey);
    }
  }, [token, setToken]);

  useEffect(() => {
    if (remoteParticipantIds.length && !start) {
      setStart(true);
      setTimeout(() => daily?.setLocalAudio(true), 4000);
    }
  }, [remoteParticipantIds, start]);

  useEffect(() => {
    if (conversation?.conversation_url && hasMediaAccess) {
      daily
        ?.join({
          url: conversation.conversation_url,
          startVideoOff: false,
          startAudioOff: true,
        })
        .then(() => {
          daily?.setLocalVideo(true);
          daily?.setLocalAudio(false);
          setVideoState('active-conversation');
        });
    }
  }, [conversation?.conversation_url, hasMediaAccess]);

  const handleFileUploadComplete = (uploadedFiles: any[]) => {
    console.log('Files uploaded successfully:', uploadedFiles);
    setActiveSection('uploaded-documents');
  };

  const requestMediaAccess = async () => {
    try {
      setIsStarting(true);
      setMediaError(null);
      
      audio.currentTime = 0;
      await audio.play();
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Request camera and microphone access
      const res = await daily?.startCamera({
        startVideoOff: false,
        startAudioOff: false,
        audioSource: "default",
      });

      if (res?.mic && res?.camera) {
        setHasMediaAccess(true);
        setVideoState('starting-conversation');
        
        // Set default devices
        // @ts-expect-error deviceId exists in the MediaDeviceInfo
        const isDefaultMic = res?.mic?.deviceId === "default";
        // @ts-expect-error deviceId exists in the MediaDeviceInfo
        const isDefaultSpeaker = res?.speaker?.deviceId === "default";

        if (!isDefaultMic) {
          setMicrophone("default");
        }
        if (!isDefaultSpeaker) {
          setSpeaker("default");
        }

        // Start conversation after media access is granted
        if (token) {
          const newConversation = await createConversation(token);
          setConversation(newConversation);
        }
      } else {
        throw new Error("Failed to access camera or microphone");
      }
    } catch (error) {
      console.error("Media access error:", error);
      setMediaError("Please allow camera and microphone access to continue with the video call.");
      setVideoState('requesting-access');
    } finally {
      setIsStarting(false);
    }
  };

  const startVideoConsultation = () => {
    setVideoState('requesting-access');
    // Don't close sections - keep dashboard visible
  };

  const closeVideoConsultation = () => {
    if (daily) {
      daily.leave();
    }
    setVideoState('none');
    setConversation(null);
    setHasMediaAccess(false);
    setStart(false);
  };

  const openSettings = () => {
    setScreenState({ currentScreen: "settings" });
  };

  const closeSection = () => {
    setActiveSection(null);
  };

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      try {
        setIsSigningOut(true);
        await signOut();
        // User will be automatically redirected to auth screen by AuthWrapper
      } catch (error) {
        console.error('Sign out error:', error);
        alert('Failed to sign out. Please try again.');
      } finally {
        setIsSigningOut(false);
      }
    }
  };

  const toggleVideo = useCallback(() => {
    daily?.setLocalVideo(!isCameraEnabled);
  }, [daily, isCameraEnabled]);

  const toggleAudio = useCallback(() => {
    daily?.setLocalAudio(!isMicEnabled);
  }, [daily, isMicEnabled]);

  const sendTextMessage = useCallback(() => {
    if (chatMessage.trim() && conversation?.conversation_id) {
      daily?.sendAppMessage({
        message_type: "conversation",
        event_type: "conversation.echo",
        conversation_id: conversation.conversation_id,
        properties: {
          modality: "text",
          text: chatMessage.trim(),
        },
      });
      setChatMessage("");
    }
  }, [chatMessage, conversation, daily]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendTextMessage();
    }
  }, [sendTextMessage]);

  const startVoiceRecording = useCallback(() => {
    if (hasMediaAccess) {
      setIsListening(true);
      daily?.setLocalAudio(true);
      
      setTimeout(() => {
        setIsListening(false);
      }, 10000);
    }
  }, [daily, hasMediaAccess]);

  const stopVoiceRecording = useCallback(() => {
    setIsListening(false);
  }, []);

  const fileCount = getFileCount();

  const dashboardOptions = [
    {
      id: 'uploaded-documents' as DashboardSection,
      icon: <Files className="size-4" />,
      title: 'Uploaded Documents',
      count: fileCount
    },
    {
      id: 'reports' as DashboardSection,
      icon: <BarChart3 className="size-4" />,
      title: 'Reports',
      count: 3
    },
    {
      id: 'chat-history' as DashboardSection,
      icon: <History className="size-4" />,
      title: 'Chat History',
      count: 12
    },
    {
      id: 'knowledge-base' as DashboardSection,
      icon: <Brain className="size-4" />,
      title: 'Knowledge Base',
      count: null
    },
    {
      id: 'settings' as DashboardSection,
      icon: <Settings className="size-4" />,
      title: 'Settings',
      count: null
    }
  ];

  const renderVideoOverlay = () => {
    if (videoState === 'none') return null;

    return (
      <div className="absolute inset-0 bg-gray-900/95 backdrop-blur-sm z-40 flex items-center justify-center">
        {videoState === 'requesting-access' && (
          <div className="text-center max-w-md">
            {isStarting ? (
              <>
                <l-quantum size="45" speed="1.75" color="white"></l-quantum>
                <p className="text-white text-lg mt-4">Requesting access...</p>
              </>
            ) : (
              <>
                <div className="mb-8">
                  <h1 className="text-white text-2xl font-bold mb-4">
                    Start Your Financial Consultation
                  </h1>
                  <p className="text-gray-300 text-base mb-8">
                    To begin your video call with your AI financial mentor, please grant access to your camera and microphone.
                  </p>
                </div>

                <div className="flex flex-col gap-4 mb-8">
                  <div className="flex items-center gap-4 bg-gray-800 border border-gray-700 rounded-lg p-4">
                    <div className="bg-green-600/20 p-3 rounded-full">
                      <Camera className="size-6 text-green-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-white font-semibold">Camera Access</h3>
                      <p className="text-gray-400 text-sm">Required for video consultation</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-gray-800 border border-gray-700 rounded-lg p-4">
                    <div className="bg-green-600/20 p-3 rounded-full">
                      <Mic className="size-6 text-green-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-white font-semibold">Microphone Access</h3>
                      <p className="text-gray-400 text-sm">Required for voice interaction</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={requestMediaAccess}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold text-lg h-auto mb-4"
                  disabled={isStarting}
                >
                  <Camera className="size-5 mr-2" />
                  <Mic className="size-5 mr-3" />
                  Enable Camera & Microphone
                </Button>

                <Button
                  onClick={closeVideoConsultation}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white px-6 py-2"
                >
                  Cancel
                </Button>

                {mediaError && (
                  <div className="mt-6 flex items-center gap-2 text-wrap rounded-lg border bg-red-500/20 border-red-500/50 p-4 text-red-200 backdrop-blur-sm">
                    <AlertTriangle className="size-5 flex-shrink-0" />
                    <p className="text-sm">{mediaError}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {videoState === 'starting-conversation' && (
          <div className="text-center">
            <l-quantum size="45" speed="1.75" color="white"></l-quantum>
            <p className="text-white text-lg mt-4">Connecting to your financial mentor...</p>
          </div>
        )}

        {videoState === 'active-conversation' && (
          <div className="w-full h-full relative">
            {remoteParticipantIds?.length > 0 ? (
              <Video
                id={remoteParticipantIds[0]}
                className="size-full"
                tileClassName="!object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <l-quantum size="45" speed="1.75" color="white"></l-quantum>
                  <p className="text-white text-lg mt-4">Your financial mentor is joining...</p>
                </div>
              </div>
            )}

            {/* User video - smaller overlay */}
            {localSessionId && (
              <Video
                id={localSessionId}
                tileClassName="!object-cover"
                className={cn(
                  "absolute bottom-32 right-4 aspect-video h-32 w-20 overflow-hidden rounded-lg border border-white/20 sm:bottom-32 lg:h-auto lg:w-40"
                )}
              />
            )}

            {/* Chat Interface - Bottom */}
            <div className="absolute bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-sm border-t border-gray-700 p-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3">
                  {/* Text Input */}
                  <div className="flex-1 relative">
                    <Input
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your financial question or use voice..."
                      className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 pr-12 h-12 rounded-lg"
                      style={{ fontFamily: "'Source Code Pro', monospace" }}
                    />
                    <Button
                      onClick={sendTextMessage}
                      disabled={!chatMessage.trim()}
                      className="absolute right-1 top-1 h-10 w-10 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50"
                      size="icon"
                    >
                      <Send className="size-4" />
                    </Button>
                  </div>

                  {/* Voice Button */}
                  <Button
                    onMouseDown={startVoiceRecording}
                    onMouseUp={stopVoiceRecording}
                    onMouseLeave={stopVoiceRecording}
                    className={cn(
                      "h-12 w-12 rounded-lg transition-all duration-200",
                      isListening 
                        ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                        : "bg-green-600 hover:bg-green-700"
                    )}
                    size="icon"
                  >
                    <Mic className="size-5" />
                  </Button>

                  {/* Video Controls */}
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      className="h-12 w-12 rounded-lg border border-gray-600 bg-gray-800 hover:bg-gray-700"
                      variant="secondary"
                      onClick={toggleAudio}
                    >
                      {!isMicEnabled ? (
                        <MicOffIcon className="size-5" />
                      ) : (
                        <MicIcon className="size-5" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      className="h-12 w-12 rounded-lg border border-gray-600 bg-gray-800 hover:bg-gray-700"
                      variant="secondary"
                      onClick={toggleVideo}
                    >
                      {!isCameraEnabled ? (
                        <VideoOffIcon className="size-5" />
                      ) : (
                        <VideoIcon className="size-5" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      className="h-12 w-12 rounded-lg bg-red-600 hover:bg-red-700"
                      variant="secondary"
                      onClick={closeVideoConsultation}
                    >
                      <PhoneIcon className="size-5 rotate-[135deg]" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <DailyAudio />
          </div>
        )}
      </div>
    );
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'uploaded-documents':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Uploaded Documents</h2>
              <div className="flex gap-3">
                <FileUpload 
                  onUploadComplete={handleFileUploadComplete}
                  maxFiles={10}
                  maxSize={25 * 1024 * 1024}
                />
                <Button
                  onClick={closeSection}
                  variant="outline"
                  size="icon"
                  className="border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>
            <FileManager />
          </div>
        );
      
      case 'reports':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Financial Reports</h2>
              <Button
                onClick={closeSection}
                variant="outline"
                size="icon"
                className="border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white"
              >
                <X className="size-4" />
              </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:bg-gray-700 transition-all duration-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-600/20 rounded-lg">
                    <TrendingUp className="size-5 text-green-400" />
                  </div>
                  <h3 className="text-base font-semibold text-white">Portfolio Analysis</h3>
                </div>
                <p className="text-gray-400 text-sm mb-3">Comprehensive analysis of your investment portfolio performance.</p>
                <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-600">
                  View Report
                  <ChevronRight className="size-4 ml-1" />
                </Button>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:bg-gray-700 transition-all duration-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-600/20 rounded-lg">
                    <PieChart className="size-5 text-blue-400" />
                  </div>
                  <h3 className="text-base font-semibold text-white">Budget Overview</h3>
                </div>
                <p className="text-gray-400 text-sm mb-3">Monthly budget breakdown with spending patterns.</p>
                <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-600">
                  View Report
                  <ChevronRight className="size-4 ml-1" />
                </Button>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:bg-gray-700 transition-all duration-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-600/20 rounded-lg">
                    <Target className="size-5 text-purple-400" />
                  </div>
                  <h3 className="text-base font-semibold text-white">Goal Progress</h3>
                </div>
                <p className="text-gray-400 text-sm mb-3">Track your financial goals and get recommendations.</p>
                <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-600">
                  View Report
                  <ChevronRight className="size-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        );

      case 'chat-history':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Chat History</h2>
              <Button
                onClick={closeSection}
                variant="outline"
                size="icon"
                className="border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white"
              >
                <X className="size-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {[
                { date: 'Today, 2:30 PM', topic: 'Investment Portfolio Review', duration: '15 min' },
                { date: 'Yesterday, 4:15 PM', topic: 'Retirement Planning Discussion', duration: '22 min' },
                { date: 'Jan 15, 10:30 AM', topic: 'Tax Optimization Strategies', duration: '18 min' },
                { date: 'Jan 12, 3:45 PM', topic: 'Emergency Fund Planning', duration: '12 min' },
                { date: 'Jan 10, 11:20 AM', topic: 'Budget Analysis and Recommendations', duration: '25 min' }
              ].map((chat, index) => (
                <div key={index} className="bg-gray-800 border border-gray-700 rounded-lg p-3 hover:bg-gray-700 transition-all duration-200 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-600/20 rounded-lg">
                        <MessageCircle className="size-4 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium text-sm">{chat.topic}</h3>
                        <p className="text-gray-400 text-xs">{chat.date} • {chat.duration}</p>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'knowledge-base':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Knowledge Base</h2>
              <Button
                onClick={closeSection}
                variant="outline"
                size="icon"
                className="border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white"
              >
                <X className="size-4" />
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <h3 className="text-base font-semibold text-white mb-3">Jargon Guide</h3>
                <p className="text-gray-400 text-sm mb-3">Understand complex financial terms with simple explanations.</p>
                <div className="space-y-2">
                  {['Asset Allocation', 'Compound Interest', 'Diversification', 'ROI'].map((term) => (
                    <div key={term} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
                      <span className="text-white text-sm">{term}</span>
                      <ChevronRight className="size-3 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <h3 className="text-base font-semibold text-white mb-3">Educational Articles</h3>
                <p className="text-gray-400 text-sm mb-3">Learn about personal finance and investing strategies.</p>
                <div className="space-y-2">
                  {[
                    'Getting Started with Investing',
                    'Building an Emergency Fund',
                    'Understanding Credit Scores',
                    'Retirement Planning Basics'
                  ].map((article) => (
                    <div key={article} className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer">
                      <FileText className="size-3 text-green-400" />
                      <span className="text-white text-xs">{article}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Settings</h2>
              <Button
                onClick={closeSection}
                variant="outline"
                size="icon"
                className="border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white"
              >
                <X className="size-4" />
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <h3 className="text-base font-semibold text-white mb-3">Account Settings</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-300 text-sm">Profile Information</span>
                    <ChevronRight className="size-3 text-gray-400" />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-300 text-sm">Security & Privacy</span>
                    <ChevronRight className="size-3 text-gray-400" />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-300 text-sm">Notification Preferences</span>
                    <ChevronRight className="size-3 text-gray-400" />
                  </div>
                  <div className="flex items-center justify-between py-2 border-t border-gray-600 pt-2 mt-3">
                    <Button
                      onClick={handleSignOut}
                      variant="destructive"
                      disabled={isSigningOut}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-xs"
                    >
                      <LogOut className="size-3" />
                      {isSigningOut ? 'Signing Out...' : 'Sign Out'}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <h3 className="text-base font-semibold text-white mb-3">AI Mentor Settings</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2 cursor-pointer" onClick={openSettings}>
                    <span className="text-gray-300 text-sm">Conversation Preferences</span>
                    <ChevronRight className="size-3 text-gray-400" />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-300 text-sm">Language Settings</span>
                    <ChevronRight className="size-3 text-gray-400" />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-300 text-sm">Data & Analytics</span>
                    <ChevronRight className="size-3 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-gray-900 flex overflow-hidden">
      {/* Left Sidebar - Financial Overview (Same width as Jargon Guide) */}
      <div className="w-80 bg-gray-800 border-r border-gray-700 p-4 overflow-hidden">
        <div className="mb-4">
          <h2 className="text-white text-lg font-bold mb-1">Financial Overview</h2>
          <p className="text-gray-400 text-xs">Your financial health at a glance</p>
        </div>

        <div className="financial-overview-scroll-container overflow-y-auto" style={{ height: 'calc(100vh - 120px)' }}>
          <div className="space-y-3">
            <div className="bg-gray-700 border border-gray-600 rounded-lg p-3 hover:bg-gray-600 transition-all duration-200">
              <div className="flex items-center justify-between mb-1">
                <div className="text-gray-300 text-xs font-medium">Total Balance</div>
                <div className="text-green-400"><Wallet className="size-4" /></div>
              </div>
              <div className="text-white text-lg font-bold mb-1">$45,230.50</div>
              <div className="flex items-center gap-1 text-xs text-green-400">
                <TrendingUp className="size-2" />
                +2.5%
              </div>
            </div>

            <div className="bg-gray-700 border border-gray-600 rounded-lg p-3 hover:bg-gray-600 transition-all duration-200">
              <div className="flex items-center justify-between mb-1">
                <div className="text-gray-300 text-xs font-medium">Monthly Savings</div>
                <div className="text-green-400"><Target className="size-4" /></div>
              </div>
              <div className="text-white text-lg font-bold mb-1">$3,200.00</div>
              <div className="flex items-center gap-1 text-xs text-green-400">
                <TrendingUp className="size-2" />
                +12.3%
              </div>
            </div>

            <div className="bg-gray-700 border border-gray-600 rounded-lg p-3 hover:bg-gray-600 transition-all duration-200">
              <div className="flex items-center justify-between mb-1">
                <div className="text-gray-300 text-xs font-medium">Investment Portfolio</div>
                <div className="text-green-400"><PieChart className="size-4" /></div>
              </div>
              <div className="text-white text-lg font-bold mb-1">$28,450.75</div>
              <div className="flex items-center gap-1 text-xs text-red-400">
                <TrendingUp className="size-2 rotate-180" />
                -1.2%
              </div>
            </div>

            <div className="bg-gray-700 border border-gray-600 rounded-lg p-3 hover:bg-gray-600 transition-all duration-200">
              <div className="flex items-center justify-between mb-1">
                <div className="text-gray-300 text-xs font-medium">Monthly Income</div>
                <div className="text-green-400"><DollarSign className="size-4" /></div>
              </div>
              <div className="text-white text-lg font-bold mb-1">$8,500.00</div>
              <div className="flex items-center gap-1 text-xs text-green-400">
                <TrendingUp className="size-2" />
                +5.8%
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-white text-base font-semibold mb-3">Recent Transactions</h3>
              <div className="space-y-2">
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-white text-xs font-medium">Salary Deposit</div>
                      <div className="text-gray-400 text-xs">Jan 15, 2025</div>
                    </div>
                    <div className="text-green-400 font-semibold text-xs">+$8,500</div>
                  </div>
                </div>

                <div className="bg-gray-700 border border-gray-600 rounded-lg p-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-white text-xs font-medium">Investment Purchase</div>
                      <div className="text-gray-400 text-xs">Jan 12, 2025</div>
                    </div>
                    <div className="text-red-400 font-semibold text-xs">-$2,000</div>
                  </div>
                </div>

                <div className="bg-gray-700 border border-gray-600 rounded-lg p-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-white text-xs font-medium">Dividend Payment</div>
                      <div className="text-gray-400 text-xs">Jan 10, 2025</div>
                    </div>
                    <div className="text-green-400 font-semibold text-xs">+$450</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-white text-base font-semibold mb-3">Goals Progress</h3>
              <div className="space-y-3">
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white text-xs font-medium">Emergency Fund</span>
                    <span className="text-gray-400 text-xs">75%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <div className="text-gray-400 text-xs mt-1">$7,500 / $10,000</div>
                </div>

                <div className="bg-gray-700 border border-gray-600 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white text-xs font-medium">Retirement Fund</span>
                    <span className="text-gray-400 text-xs">45%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-1.5">
                    <div className="bg-green-400 h-1.5 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  <div className="text-gray-400 text-xs mt-1">$45,000 / $100,000</div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 text-xs text-gray-500">
                <Shield className="size-3" />
                <span>Secured with bank-level encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Dashboard Navigation */}
        <div className="bg-gray-800 border-b border-gray-700 p-4 flex-shrink-0">
          <div className="flex gap-2 overflow-x-auto">
            {dashboardOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setActiveSection(option.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 whitespace-nowrap ${
                  activeSection === option.id
                    ? 'bg-green-600/20 border-green-600/50 text-green-400'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500'
                }`}
              >
                {option.icon}
                <span className="text-sm font-medium">{option.title}</span>
                {option.count !== null && (
                  <span className="text-xs bg-gray-600 text-gray-300 px-2 py-0.5 rounded-full">
                    {option.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Video Consultation Section */}
        <div className="bg-gray-800 border-b border-gray-700 p-4 flex-shrink-0">
          <div className="flex items-center justify-center">
            <Button
              onClick={startVideoConsultation}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-green-600/25 transition-all duration-200"
            >
              <VideoIcon className="size-5 mr-2" />
              Start Video Consultation
              <ArrowRight className="size-5 ml-2" />
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-4 overflow-y-auto">
          {renderSectionContent()}
        </div>

        {/* Video Consultation Overlay */}
        {renderVideoOverlay()}
      </div>

      {/* Right Sidebar - Jargon Guide (Same width as Financial Overview) */}
      <JargonGuide />
    </div>
  );
};