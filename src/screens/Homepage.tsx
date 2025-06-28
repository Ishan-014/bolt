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
  Search,
  Plus,
  Paperclip
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

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type: 'text' | 'voice';
}

export const Homepage: React.FC = () => {
  const [, setScreenState] = useAtom(screenAtom);
  const [activeSection, setActiveSection] = useState<DashboardSection>(null);
  const [conversation, setConversation] = useAtom(conversationAtom);
  const [token, setToken] = useAtom(apiTokenAtom);
  const [hasMediaAccess, setHasMediaAccess] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [start, setStart] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isPersonaActive, setIsPersonaActive] = useState(false);
  const [conversationStartTime, setConversationStartTime] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  const { user, signOut } = useAuth();
  const { files, getFileCount } = useUserFiles();

  // Daily.co hooks
  const daily = useDaily();
  const { currentMic, setMicrophone, setSpeaker } = useDevices();
  const localSessionId = useLocalSessionId();
  const localVideo = useVideoTrack(localSessionId);
  const localAudio = useAudioTrack(localSessionId);
  const isCameraEnabled = !localVideo.isOff;
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
      setConversationStartTime(Date.now());
      setTimeRemaining(60); // 1 minute = 60 seconds
      console.log('Persona joined - starting 1 minute timer');
      
      // Keep mic off initially
      setTimeout(() => {
        daily?.setLocalAudio(false);
      }, 1000);
    }
  }, [remoteParticipantIds, start]);

  // 1-minute countdown timer
  useEffect(() => {
    if (conversationStartTime && timeRemaining !== null) {
      const timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - conversationStartTime) / 1000);
        const remaining = Math.max(0, 60 - elapsed);
        setTimeRemaining(remaining);
        
        if (remaining === 0) {
          console.log('1 minute completed - ending conversation');
          stopPersonaChat();
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [conversationStartTime, timeRemaining]);

  useEffect(() => {
    if (conversation?.conversation_url && hasMediaAccess) {
      console.log('Joining conversation with URL:', conversation.conversation_url);
      
      daily
        ?.join({
          url: conversation.conversation_url,
          startVideoOff: true,
          startAudioOff: true,
        })
        .then(() => {
          console.log('Successfully joined Daily.co room');
          daily?.setLocalVideo(false);
          daily?.setLocalAudio(false);
          setIsPersonaActive(true);
          
          // Send initial greeting after a short delay
          setTimeout(() => {
            if (conversation?.conversation_id) {
              daily?.sendAppMessage({
                message_type: "conversation",
                event_type: "conversation.echo",
                conversation_id: conversation.conversation_id,
                properties: {
                  modality: "text",
                  text: "Hello! I'm ready to discuss my financial goals with you.",
                },
              });
            }
          }, 2000);
        })
        .catch((error) => {
          console.error('Failed to join Daily.co room:', error);
          setMediaError('Failed to connect to the conversation. Please try again.');
        });
    }
  }, [conversation?.conversation_url, hasMediaAccess]);

  // Listen for Daily.co events and Tavus responses
  useEffect(() => {
    if (!daily) return;

    const handleAppMessage = (event: any) => {
      console.log('Received app message:', event);
      
      // Handle Tavus conversation responses
      if (event.data?.event_type === 'conversation.response' || 
          event.data?.event_type === 'conversation.participant_response') {
        const responseText = event.data.properties?.text || 
                           event.data.properties?.content ||
                           'I received your message.';
        
        const assistantMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: responseText,
          timestamp: new Date(),
          type: 'text'
        };
        setChatMessages(prev => [...prev, assistantMessage]);
      }
    };

    const handleParticipantLeft = (event: any) => {
      console.log('Participant left:', event);
      
      if (event.participant?.session_id !== localSessionId) {
        console.log('Persona left the conversation');
        // Don't try to reconnect - let it end naturally
      }
    };

    const handleParticipantJoined = (event: any) => {
      console.log('Participant joined:', event);
    };

    daily.on('app-message', handleAppMessage);
    daily.on('participant-left', handleParticipantLeft);
    daily.on('participant-joined', handleParticipantJoined);

    return () => {
      daily.off('app-message', handleAppMessage);
      daily.off('participant-left', handleParticipantLeft);
      daily.off('participant-joined', handleParticipantJoined);
    };
  }, [daily, localSessionId]);

  const handleFileUploadComplete = (uploadedFiles: any[]) => {
    console.log('Files uploaded successfully:', uploadedFiles);
    setActiveSection('uploaded-documents');
  };

  const startPersonaChat = async () => {
    try {
      setIsStarting(true);
      setMediaError(null);
      
      audio.currentTime = 0;
      await audio.play();
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Request only microphone access
      const res = await daily?.startCamera({
        startVideoOff: true,
        startAudioOff: true,
        audioSource: "default",
      });

      if (res?.mic) {
        setHasMediaAccess(true);
        
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
          console.log('Creating new conversation...');
          const newConversation = await createConversation(token);
          console.log('Conversation created:', newConversation);
          setConversation(newConversation);
        }
      } else {
        throw new Error("Failed to access microphone");
      }
    } catch (error) {
      console.error("Media access error:", error);
      setMediaError("Please allow microphone access to continue with the chat.");
    } finally {
      setIsStarting(false);
    }
  };

  const stopPersonaChat = () => {
    console.log('Stopping persona chat');
    if (daily) {
      daily.leave();
    }
    setIsPersonaActive(false);
    setConversation(null);
    setHasMediaAccess(false);
    setStart(false);
    setChatMessages([]);
    setIsMicEnabled(false);
    setConversationStartTime(null);
    setTimeRemaining(null);
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
      } catch (error) {
        console.error('Sign out error:', error);
        alert('Failed to sign out. Please try again.');
      } finally {
        setIsSigningOut(false);
      }
    }
  };

  const sendTextMessage = useCallback(() => {
    if (chatMessage.trim() && conversation?.conversation_id) {
      // Add user message to chat
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: chatMessage.trim(),
        timestamp: new Date(),
        type: 'text'
      };
      setChatMessages(prev => [...prev, userMessage]);

      // Send to persona using the correct Tavus API event
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

  const toggleMicrophone = useCallback(() => {
    if (hasMediaAccess && conversation?.conversation_id) {
      const newMicState = !isMicEnabled;
      setIsMicEnabled(newMicState);
      
      // Actually enable/disable the microphone in Daily.co
      daily?.setLocalAudio(newMicState);
      
      if (newMicState) {
        console.log('Microphone enabled - starting voice input');
        
        // Add voice message indicator
        const voiceMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'user',
          content: 'Listening...',
          timestamp: new Date(),
          type: 'voice'
        };
        setChatMessages(prev => [...prev, voiceMessage]);
      } else {
        console.log('Microphone disabled');
        
        // Remove the "Listening..." message when mic is turned off
        setChatMessages(prev => prev.filter(msg => msg.content !== 'Listening...'));
      }
    }
  }, [daily, hasMediaAccess, isMicEnabled, conversation]);

  const fileCount = getFileCount();

  const dashboardOptions = [
    {
      id: 'uploaded-documents' as DashboardSection,
      icon: <Files className="size-4" />,
      title: 'Documents',
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
      title: 'History',
      count: 12
    },
    {
      id: 'knowledge-base' as DashboardSection,
      icon: <Brain className="size-4" />,
      title: 'Knowledge',
      count: null
    },
    {
      id: 'settings' as DashboardSection,
      icon: <Settings className="size-4" />,
      title: 'Settings',
      count: null
    }
  ];

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
                      className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md text-xs h-6"
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen bg-gray-900 flex overflow-hidden">
      {/* Left Sidebar - Financial Overview */}
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
      
      {/* Main Content - Persona Chat Interface */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Header with FinIQ.ai Branding and Dashboard - Reduced Height */}
        <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            {/* Left: FinIQ.ai Branding and User Welcome */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="size-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
                    FinIQ.ai
                  </h1>
                  {user && (
                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                      <User className="size-2.5" />
                      <span>Welcome back, {user.user_metadata?.full_name || user.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Dashboard Navigation - Icons Only with Tooltips - Reduced Size */}
            <div className="flex gap-1.5">
              {dashboardOptions.map((option) => (
                <div key={option.id} className="relative group">
                  <button
                    onClick={() => setActiveSection(option.id)}
                    className={`p-2 rounded-lg border transition-all duration-200 relative ${
                      activeSection === option.id
                        ? 'bg-green-600/20 border-green-600/50 text-green-400'
                        : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500'
                    }`}
                  >
                    {option.icon}
                    {option.count !== null && (
                      <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white px-1 py-0.5 rounded-full min-w-[16px] h-[16px] flex items-center justify-center text-[10px]">
                        {option.count}
                      </span>
                    )}
                  </button>
                  
                  {/* Tooltip - Now positioned below */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {option.title}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Persona Chat Interface */}
        {!activeSection && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {!isPersonaActive ? (
              /* Start Chat Interface */
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <User className="size-12 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Meet Your AI Financial Mentor
                  </h2>
                  <p className="text-gray-300 text-base mb-8">
                    Start a conversation with your personalized AI financial advisor. Ask questions, get insights, and upload documents for analysis.
                  </p>
                  
                  {mediaError && (
                    <div className="mb-6 flex items-center gap-2 text-wrap rounded-lg border bg-red-500/20 border-red-500/50 p-4 text-red-200 backdrop-blur-sm">
                      <AlertTriangle className="size-5 flex-shrink-0" />
                      <p className="text-sm">{mediaError}</p>
                    </div>
                  )}

                  <Button
                    onClick={startPersonaChat}
                    disabled={isStarting}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-green-600/25 transition-all duration-200"
                  >
                    {isStarting ? (
                      <>
                        <l-quantum size="20" speed="1.75" color="white"></l-quantum>
                        <span className="ml-2">Starting...</span>
                      </>
                    ) : (
                      <>
                        <MessageCircle className="size-5 mr-2" />
                        Start Conversation
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              /* Active Chat Interface */
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Persona Video */}
                <div className="flex-1 relative bg-black">
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

                  {/* Timer Display */}
                  {timeRemaining !== null && (
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
                      <div className="text-white text-sm font-medium">
                        Time Remaining: {formatTime(timeRemaining)}
                      </div>
                    </div>
                  )}

                  {/* Chat Messages Overlay - Positioned at bottom with gradient fade */}
                  <div className="absolute bottom-20 left-4 right-4 max-h-48 overflow-hidden">
                    <div 
                      className="space-y-3 overflow-y-auto scrollbar-hide pb-4"
                      style={{
                        maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)'
                      }}
                    >
                      {chatMessages.slice(-3).map((message, index) => (
                        <div
                          key={message.id}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                          style={{
                            opacity: 1 - (index * 0.3), // Fade effect for older messages
                          }}
                        >
                          <div
                            className={`max-w-xs px-4 py-2 rounded-lg text-sm backdrop-blur-sm ${
                              message.role === 'user'
                                ? 'bg-green-600/80 text-white'
                                : 'bg-gray-800/80 text-gray-200 border border-gray-600/50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {message.type === 'voice' && <Mic className="size-3" />}
                              <span>{message.content}</span>
                            </div>
                            <div className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* End Chat Button */}
                  <div className="absolute top-4 right-4">
                    <Button
                      onClick={stopPersonaChat}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                    >
                      <PhoneIcon className="size-4 rotate-[135deg] mr-2" />
                      End Chat
                    </Button>
                  </div>
                </div>

                {/* Chat Input */}
                <div className="bg-gray-800 border-t border-gray-700 p-4 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    {/* File Upload Button */}
                    <FileUpload 
                      onUploadComplete={handleFileUploadComplete}
                      maxFiles={5}
                      maxSize={25 * 1024 * 1024}
                    />

                    {/* Text Input */}
                    <div className="flex-1 relative">
                      <Input
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask your financial mentor anything..."
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 pr-12 h-12 rounded-lg"
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

                    {/* Microphone Toggle Button */}
                    <Button
                      onClick={toggleMicrophone}
                      className={cn(
                        "h-12 w-12 rounded-lg transition-all duration-200",
                        isMicEnabled 
                          ? "bg-red-500 hover:bg-red-600" 
                          : "bg-green-600 hover:bg-green-700"
                      )}
                      size="icon"
                    >
                      {isMicEnabled ? <MicIcon className="size-5" /> : <MicOffIcon className="size-5" />}
                    </Button>
                  </div>

                  {/* Instructions */}
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-400 justify-center">
                    <span>💬 Type your question and press Enter</span>
                    <span>🎤 Click mic to toggle voice input</span>
                    <span>📎 Click + to upload documents</span>
                    {timeRemaining !== null && (
                      <span>⏱️ Conversation ends automatically after 1 minute</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Section Content */}
        {activeSection && (
          <div className="flex-1 p-4 overflow-y-auto">
            {renderSectionContent()}
          </div>
        )}

        <DailyAudio />
      </div>

      {/* Right Sidebar - Jargon Guide */}
      <JargonGuide />
    </div>
  );
};