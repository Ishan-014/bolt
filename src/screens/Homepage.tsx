import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/FileUpload';
import { FileManager } from '@/components/FileManager';
import { FinancialTutor } from '@/components/FinancialTutor';
import { VoiceTranscript } from '@/components/VoiceTranscript';
import { ChatHistoryPanel } from '@/components/ChatHistoryPanel';
import { useAtom } from 'jotai';
import { screenAtom } from '@/store/screens';
import { useAuth } from '@/hooks/useAuth';
import { useUserFiles } from '@/hooks/useUserFiles';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useFinancialChat } from '@/hooks/useFinancialChat';
import { useChatHistory } from '@/hooks/useChatHistory';
import { highlightJargon } from '@/utils/jargonHighlighter';
import { 
  Files, 
  TrendingUp, 
  Shield, 
  Target,
  BarChart3,
  User,
  DollarSign,
  PieChart,
  Wallet,
  Settings,
  FileText,
  History,
  Brain,
  ChevronRight,
  X,
  Send,
  LogOut,
  Plus,
  Bot,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Database,
  Volume2,
  VolumeX,
  Loader2,
  Check,
  Mic
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type DashboardSection = 'uploaded-documents' | 'reports' | 'chat-history' | 'knowledge-base' | 'settings' | null;

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type: 'text' | 'voice';
  isInterim?: boolean;
}

export const Homepage: React.FC = () => {
  const [, setScreenState] = useAtom(screenAtom);
  const [activeSection, setActiveSection] = useState<DashboardSection>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentInterimMessageId, setCurrentInterimMessageId] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
  const [tutorWidth, setTutorWidth] = useState(320);

  const { user, signOut } = useAuth();
  const { files, getFileCount, refetch: refetchFiles } = useUserFiles();
  const { generateResponse, isGenerating } = useFinancialChat();
  const { 
    chatSessions, 
    currentSessionId, 
    createNewSession, 
    updateSession, 
    loadSession, 
    getCurrentSession,
    setCurrentSessionId 
  } = useChatHistory();

  // Initialize chat with welcome message on component mount
  useEffect(() => {
    if (!currentSessionId) {
      const sessionId = createNewSession();
      const welcomeMessage: ChatMessage = {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: "Hello! I'm FinIQ.ai, your AI financial mentor. I have access to your uploaded documents and can explain financial terms from my knowledge base. What would you like to discuss today?",
        timestamp: new Date(),
        type: 'text'
      };
      setChatMessages([welcomeMessage]);
      updateSession(sessionId, [welcomeMessage]);
    } else {
      const session = getCurrentSession();
      if (session) {
        setChatMessages(session.messages);
      }
    }
  }, []);

  // Update session when messages change
  useEffect(() => {
    if (currentSessionId && chatMessages.length > 0) {
      updateSession(currentSessionId, chatMessages);
    }
  }, [chatMessages, currentSessionId]);

  // Speech recognition
  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported: speechSupported,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition({
    onResult: (result) => {
      console.log('Speech result:', result);
      
      if (!result.isFinal && result.transcript) {
        // Handle interim results - show real-time transcription
        if (currentInterimMessageId) {
          // Update existing interim message
          setChatMessages(prev => prev.map(msg => 
            msg.id === currentInterimMessageId 
              ? { ...msg, content: result.transcript }
              : msg
          ));
        } else {
          // Create new interim message
          const interimId = `interim-${Date.now()}`;
          const interimMessage: ChatMessage = {
            id: interimId,
            role: 'user',
            content: result.transcript,
            timestamp: new Date(),
            type: 'voice',
            isInterim: true
          };
          setChatMessages(prev => [...prev, interimMessage]);
          setCurrentInterimMessageId(interimId);
        }
      } else if (result.isFinal && result.transcript.trim()) {
        // Handle final result
        if (currentInterimMessageId) {
          // Replace interim message with final one
          setChatMessages(prev => prev.map(msg => 
            msg.id === currentInterimMessageId 
              ? { ...msg, content: result.transcript.trim(), isInterim: false }
              : msg
          ));
          setCurrentInterimMessageId(null);
        } else {
          // Create new final message
          const finalMessage: ChatMessage = {
            id: `voice-${Date.now()}`,
            role: 'user',
            content: result.transcript.trim(),
            timestamp: new Date(),
            type: 'voice'
          };
          setChatMessages(prev => [...prev, finalMessage]);
        }
        
        // Send to AI and get response
        handleSendMessage(result.transcript.trim());
        resetTranscript();
      }
    },
    onEnd: () => {
      console.log('Speech recognition ended');
      // Clean up any interim message if speech ended without final result
      if (currentInterimMessageId) {
        setChatMessages(prev => prev.filter(msg => msg.id !== currentInterimMessageId));
        setCurrentInterimMessageId(null);
      }
    },
    onError: (error) => {
      console.error('Speech recognition error:', error);
      // Clean up interim message on error
      if (currentInterimMessageId) {
        setChatMessages(prev => prev.filter(msg => msg.id !== currentInterimMessageId));
        setCurrentInterimMessageId(null);
      }
    }
  });

  const handleFileUploadComplete = (uploadedFiles: any[]) => {
    console.log('Files uploaded successfully:', uploadedFiles);
    // Refresh files list to update the AI context
    refetchFiles();
    setActiveSection('uploaded-documents');
    
    // Add a system message about the uploaded files
    const systemMessage: ChatMessage = {
      id: `system-${Date.now()}`,
      role: 'assistant',
      content: `I've noted that you've uploaded ${uploadedFiles.length} new document(s). I now have access to information about these files and can reference them in our conversation. Feel free to ask me about analyzing or reviewing your uploaded documents!`,
      timestamp: new Date(),
      type: 'text'
    };
    setChatMessages(prev => [...prev, systemMessage]);
  };

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    try {
      console.log('Sending message to Google Gemini with context:', messageText);
      
      // Generate AI response using Google Gemini with full context
      const aiResponse = await generateResponse(messageText.trim());
      
      // Add AI response to chat
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        type: 'text'
      };
      setChatMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error handling message:', error);
      
      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "I'm sorry, I'm having trouble processing your request right now. Please try again.",
        timestamp: new Date(),
        type: 'text'
      };
      setChatMessages(prev => [...prev, errorMessage]);
    }
  };

  const startNewChat = () => {
    const sessionId = createNewSession();
    const welcomeMessage: ChatMessage = {
      id: `welcome-${Date.now()}`,
      role: 'assistant',
      content: "Hello! I'm FinIQ.ai, your AI financial mentor. I have access to your uploaded documents and can explain financial terms from my knowledge base. What would you like to discuss today?",
      timestamp: new Date(),
      type: 'text'
    };
    setChatMessages([welcomeMessage]);
    resetTranscript();
    if (currentInterimMessageId) {
      setCurrentInterimMessageId(null);
    }
    stopAudio();
  };

  const loadChatSession = (sessionId: string) => {
    const session = loadSession(sessionId);
    if (session) {
      setChatMessages(session.messages);
      setActiveSection(null); // Close any open sections
      resetTranscript();
      if (currentInterimMessageId) {
        setCurrentInterimMessageId(null);
      }
      stopAudio();
    }
  };

  const refreshContext = async () => {
    // Refresh files to update AI context
    await refetchFiles();
    
    // Add a system message about context refresh
    const systemMessage: ChatMessage = {
      id: `refresh-${Date.now()}`,
      role: 'assistant',
      content: "I've refreshed my access to your latest documents and financial information. My responses will now reflect any recent changes or uploads.",
      timestamp: new Date(),
      type: 'text'
    };
    setChatMessages(prev => [...prev, systemMessage]);
  };

  const playAudio = async (text: string, messageId: string) => {
    try {
      setIsPlayingAudio(messageId);

      // Stop any currently playing speech
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }

      console.log('Playing audio for message:', messageId);

      // Use browser's built-in speech synthesis with female voice
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Get available voices and select a female voice
        const voices = speechSynthesis.getVoices();
        const femaleVoice = voices.find(voice => 
          voice.name.toLowerCase().includes('female') ||
          voice.name.toLowerCase().includes('woman') ||
          voice.name.toLowerCase().includes('samantha') ||
          voice.name.toLowerCase().includes('karen') ||
          voice.name.toLowerCase().includes('susan') ||
          voice.name.toLowerCase().includes('victoria') ||
          voice.name.toLowerCase().includes('zira') ||
          voice.name.toLowerCase().includes('hazel')
        );
        
        if (femaleVoice) {
          utterance.voice = femaleVoice;
        } else {
          // Fallback: try to find any voice that sounds female by name patterns
          const possibleFemaleVoice = voices.find(voice => 
            voice.name.includes('Google UK English Female') ||
            voice.name.includes('Microsoft Zira') ||
            voice.name.includes('Microsoft Hazel') ||
            voice.name.includes('Alex') && voice.lang.includes('en')
          );
          if (possibleFemaleVoice) {
            utterance.voice = possibleFemaleVoice;
          }
        }
        
        utterance.rate = 0.85;
        utterance.pitch = 1.1; // Slightly higher pitch for more feminine sound
        utterance.volume = 0.8;
        
        utterance.onend = () => {
          setIsPlayingAudio(null);
        };
        
        utterance.onerror = (event) => {
          setIsPlayingAudio(null);
          console.error('Speech synthesis error:', event.error);
        };
        
        speechSynthesis.speak(utterance);
      } else {
        throw new Error('Speech synthesis not supported in this browser');
      }

    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlayingAudio(null);
      alert('Failed to play audio. Speech synthesis may not be supported in your browser.');
    }
  };

  const stopAudio = () => {
    console.log('Stopping audio playback');
    
    // Stop browser speech synthesis
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    
    setIsPlayingAudio(null);
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
    if (chatMessage.trim()) {
      // Add user message to chat immediately
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: chatMessage.trim(),
        timestamp: new Date(),
        type: 'text'
      };
      setChatMessages(prev => [...prev, userMessage]);

      // Send to AI
      handleSendMessage(chatMessage.trim());
      setChatMessage("");
    }
  }, [chatMessage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendTextMessage();
    }
  }, [sendTextMessage]);

  const startVoiceRecording = useCallback(() => {
    if (speechSupported && !isListening) {
      console.log('Starting voice recording...');
      startListening();
    } else if (!speechSupported) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
    }
  }, [speechSupported, isListening, startListening]);

  const stopVoiceRecording = useCallback(() => {
    if (isListening) {
      console.log('Stopping voice recording...');
      stopListening();
    }
  }, [isListening, stopListening]);

  const copyMessage = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessage(messageId);
      setTimeout(() => setCopiedMessage(null), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const fileCount = getFileCount();

  const dashboardOptions = [
    {
      id: 'uploaded-documents' as DashboardSection,
      icon: <Files className="size-5" />,
      title: 'Documents',
      count: fileCount
    },
    {
      id: 'reports' as DashboardSection,
      icon: <BarChart3 className="size-5" />,
      title: 'Reports',
      count: 3
    },
    {
      id: 'chat-history' as DashboardSection,
      icon: <History className="size-5" />,
      title: 'History',
      count: chatSessions.length
    },
    {
      id: 'knowledge-base' as DashboardSection,
      icon: <Brain className="size-5" />,
      title: 'Knowledge',
      count: null
    },
    {
      id: 'settings' as DashboardSection,
      icon: <Settings className="size-5" />,
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
              <div>
                <h2 className="text-xl font-bold text-white">Uploaded Documents</h2>
                <p className="text-gray-400 text-sm">Your AI mentor has access to these documents</p>
              </div>
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
                  className="border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white h-12 w-12"
                >
                  <X className="size-5" />
                </Button>
              </div>
            </div>
            
            {/* AI Integration Notice */}
            <div className="p-3 bg-green-900/30 border border-green-700/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Database className="size-4 text-green-400" />
                <span className="text-green-300 text-sm font-medium">AI Integration Active</span>
              </div>
              <p className="text-green-200/80 text-xs">
                Your AI mentor can reference these documents in conversations and provide personalized advice based on your uploads.
              </p>
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
                className="border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white h-12 w-12"
              >
                <X className="size-5" />
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
                <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-600 h-10">
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
                <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-600 h-10">
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
                <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-600 h-10">
                  View Report
                  <ChevronRight className="size-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        );

      case 'chat-history':
        return (
          <ChatHistoryPanel
            chatSessions={chatSessions}
            currentSessionId={currentSessionId}
            onLoadSession={loadChatSession}
            onNewSession={startNewChat}
            onClose={closeSection}
          />
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
                className="border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white h-12 w-12"
              >
                <X className="size-5" />
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <h3 className="text-base font-semibold text-white mb-3">Financial Terms</h3>
                <p className="text-gray-400 text-sm mb-3">Financial terms your AI mentor can explain and reference.</p>
                <div className="space-y-2">
                  {['Asset Allocation', 'Compound Interest', 'Diversification', 'ROI'].map((term) => (
                    <div key={term} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
                      <span className="text-white text-sm font-bold text-green-400">{term}</span>
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
                className="border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white h-12 w-12"
              >
                <X className="size-5" />
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
                      className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm h-10"
                    >
                      <LogOut className="size-4" />
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
      
      {/* Main Content - Chat Interface (Always Active) */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Header with FinIQ.ai Branding and Dashboard */}
        <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            {/* Left: FinIQ.ai Branding and User Welcome */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="size-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
                    FinIQ.ai
                  </h1>
                  {user && (
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <User className="size-3" />
                      <span>Welcome back, {user.user_metadata?.full_name || user.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Dashboard Navigation */}
            <div className="flex gap-2">
              {dashboardOptions.map((option) => (
                <div key={option.id} className="relative group">
                  <button
                    onClick={() => setActiveSection(option.id)}
                    className={`p-3 rounded-lg border transition-all duration-200 relative ${
                      activeSection === option.id
                        ? 'bg-green-600/20 border-green-600/50 text-green-400'
                        : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500'
                    }`}
                  >
                    {option.icon}
                    {option.count !== null && (
                      <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full min-w-[20px] h-[20px] flex items-center justify-center text-[10px]">
                        {option.count}
                      </span>
                    )}
                  </button>
                  
                  {/* Tooltip */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {option.title}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Interface (Always Active) */}
        {!activeSection && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-3xl ${message.role === 'user' ? 'ml-12' : 'mr-12'}`}>
                    <div
                      className={`rounded-lg p-4 ${
                        message.role === 'user'
                          ? message.isInterim 
                            ? 'bg-green-600/70 text-white border border-green-400'
                            : 'bg-green-600 text-white'
                          : 'bg-gray-800 text-gray-200 border border-gray-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.role === 'user' ? 'bg-green-700' : 'bg-gray-700'
                        }`}>
                          {message.role === 'user' ? (
                            message.type === 'voice' ? <Mic className="size-4" /> : <User className="size-4" />
                          ) : (
                            <Bot className="size-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {message.role === 'user' ? 'You' : 'FinIQ.ai'}
                            </span>
                            <span className="text-xs opacity-70">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <div className={`text-sm leading-relaxed ${message.isInterim ? 'italic' : ''}`}>
                            {message.role === 'assistant' && !message.isInterim 
                              ? highlightJargon(message.content)
                              : message.content
                            }
                            {message.isInterim && <span className="animate-pulse text-green-200 ml-1">|</span>}
                          </div>
                          {message.role === 'assistant' && !message.isInterim && (
                            <div className="flex items-center gap-2 mt-2">
                              <Button
                                onClick={() => isPlayingAudio === message.id ? stopAudio() : playAudio(message.content, message.id)}
                                variant="ghost"
                                size="sm"
                                className="h-8 px-3 text-xs text-gray-400 hover:text-white"
                                disabled={isPlayingAudio !== null && isPlayingAudio !== message.id}
                              >
                                {isPlayingAudio === message.id ? (
                                  <>
                                    <VolumeX className="size-3 mr-1" />
                                    Stop
                                  </>
                                ) : (
                                  <>
                                    <Volume2 className="size-3 mr-1" />
                                    Play
                                  </>
                                )}
                              </Button>
                              <Button
                                onClick={() => copyMessage(message.content, message.id)}
                                variant="ghost"
                                size="sm"
                                className="h-8 px-3 text-xs text-gray-400 hover:text-white"
                              >
                                {copiedMessage === message.id ? (
                                  <Check className="size-3 mr-1" />
                                ) : (
                                  <Copy className="size-3 mr-1" />
                                )}
                                {copiedMessage === message.id ? 'Copied' : 'Copy'}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-3 text-xs text-gray-400 hover:text-white"
                              >
                                <ThumbsUp className="size-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-3 text-xs text-gray-400 hover:text-white"
                              >
                                <ThumbsDown className="size-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isGenerating && (
                <div className="flex justify-start">
                  <div className="max-w-3xl mr-12">
                    <div className="bg-gray-800 text-gray-200 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="size-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">FinIQ.ai</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Loader2 className="size-4 animate-spin" />
                            <span className="text-sm text-gray-400">Analyzing your data...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Voice Transcript Overlay */}
            {(isListening || interimTranscript) && (
              <div className="absolute bottom-24 left-4">
                <VoiceTranscript
                  isListening={isListening}
                  transcript={transcript}
                  interimTranscript={interimTranscript}
                />
              </div>
            )}

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
                    placeholder="Ask about your documents, financial terms, or get personalized advice..."
                    disabled={isGenerating}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 pr-12 h-12 rounded-lg"
                    style={{ fontFamily: "'Source Code Pro', monospace" }}
                  />
                  <Button
                    onClick={sendTextMessage}
                    disabled={!chatMessage.trim() || isGenerating}
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
                  disabled={isGenerating}
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

                {/* Refresh Context Button */}
                <Button
                  onClick={refreshContext}
                  className="h-12 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  title="Refresh AI context with latest data"
                >
                  <RefreshCw className="size-4 mr-2" />
                  Refresh
                </Button>

                {/* New Chat Button */}
                <Button
                  onClick={startNewChat}
                  className="h-12 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                >
                  <Plus className="size-4 mr-2" />
                  New Chat
                </Button>
              </div>

              {/* Instructions */}
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-400 justify-center">
                <span>💬 Ask about your uploaded documents</span>
                <span>🎤 Hold voice button to speak</span>
                <span>📚 Financial terms appear with tooltips</span>
                <span>🔊 Click play to hear responses</span>
                <span>🔄 Refresh updates AI context</span>
                {!speechSupported && <span className="text-red-400">⚠️ Speech recognition not supported in this browser</span>}
              </div>
            </div>
          </div>
        )}

        {/* Section Content */}
        {activeSection && (
          <div className="flex-1 p-4 overflow-y-auto">
            {renderSectionContent()}
          </div>
        )}
      </div>

      {/* Right Sidebar - Financial Tutor */}
      <FinancialTutor 
        width={tutorWidth}
        onWidthChange={setTutorWidth}
      />
    </div>
  );
};