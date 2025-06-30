import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, Volume2, VolumeX, Loader2, Send, Copy, Check, Bot, User, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFinancialChat } from '@/hooks/useFinancialChat';
import { highlightJargon } from '@/utils/jargonHighlighter';
import { cn } from '@/lib/utils';

interface TutorMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isPlaying?: boolean;
}

interface FinancialTutorProps {
  className?: string;
  width?: number;
  onWidthChange?: (width: number) => void;
}

// Knowledge base storage
const saveToKnowledgeBase = (topic: string, content: string) => {
  try {
    const existingKnowledge = JSON.parse(localStorage.getItem('financial-knowledge-base') || '[]');
    const newEntry = {
      id: `knowledge-${Date.now()}`,
      topic,
      content,
      timestamp: new Date().toISOString(),
      source: 'AI Tutor'
    };
    
    // Check if similar topic already exists
    const existingIndex = existingKnowledge.findIndex((entry: any) => 
      entry.topic.toLowerCase() === topic.toLowerCase()
    );
    
    if (existingIndex >= 0) {
      // Update existing entry
      existingKnowledge[existingIndex] = { ...existingKnowledge[existingIndex], ...newEntry };
    } else {
      // Add new entry
      existingKnowledge.push(newEntry);
    }
    
    localStorage.setItem('financial-knowledge-base', JSON.stringify(existingKnowledge));
    console.log('Saved to knowledge base:', topic);
  } catch (error) {
    console.error('Error saving to knowledge base:', error);
  }
};

export const FinancialTutor: React.FC<FinancialTutorProps> = ({ 
  className, 
  width = 320, 
  onWidthChange 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);

  const { generateResponse, isGenerating } = useFinancialChat();

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: TutorMessage = {
      id: `welcome-${Date.now()}`,
      role: 'assistant',
      content: "Welcome to your Financial Tutor! I'm here to teach you about any financial concept, from basic budgeting to advanced investment strategies. What would you like to learn about today?",
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle mouse resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = window.innerWidth - e.clientX;
      const minWidth = 280;
      const maxWidth = 600;
      
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        onWidthChange?.(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, onWidthChange]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    // Add user message
    const userMessage: TutorMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: searchQuery.trim(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Generate tutor response with educational context
      const tutorPrompt = `As a Financial Tutor, please teach me about: ${searchQuery.trim()}. 

Please provide:
1. A clear, educational explanation
2. Real-world examples
3. Practical applications
4. Key takeaways or tips

Make it engaging and easy to understand, suitable for someone learning about finance.`;

      const response = await generateResponse(tutorPrompt);
      
      const assistantMessage: TutorMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Save the teaching content to knowledge base
      saveToKnowledgeBase(searchQuery.trim(), response);
      
    } catch (error) {
      console.error('Error generating tutor response:', error);
      const errorMessage: TutorMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "I'm sorry, I'm having trouble processing your question right now. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setSearchQuery('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
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

  const copyMessage = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessage(messageId);
      setTimeout(() => setCopiedMessage(null), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const clearTutorChat = () => {
    const welcomeMessage: TutorMessage = {
      id: `welcome-${Date.now()}`,
      role: 'assistant',
      content: "Welcome to your Financial Tutor! I'm here to teach you about any financial concept, from basic budgeting to advanced investment strategies. What would you like to learn about today?",
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
    stopAudio();
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    if (!isCollapsed) {
      onWidthChange?.(60); // Collapsed width
    } else {
      onWidthChange?.(320); // Default width
    }
  };

  const adjustWidth = (delta: number) => {
    const newWidth = Math.max(280, Math.min(600, width + delta));
    onWidthChange?.(newWidth);
  };

  if (isCollapsed) {
    return (
      <div 
        className={cn("bg-gray-800 border-l border-gray-700 flex flex-col items-center py-4", className)}
        style={{ width: 60 }}
      >
        <Button
          onClick={toggleCollapse}
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white hover:bg-gray-700 w-10 h-10"
        >
          <ChevronLeft className="size-5" />
        </Button>
        <div className="mt-4 writing-mode-vertical text-gray-400 text-sm font-medium transform rotate-90 whitespace-nowrap">
          Financial Tutor
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn("bg-gray-800 border-l border-gray-700 flex flex-col overflow-hidden relative", className)}
      style={{ width }}
    >
      {/* Resize handle */}
      <div
        ref={resizeRef}
        className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-green-500 transition-colors z-10"
        onMouseDown={() => setIsResizing(true)}
      />

      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="size-5 text-green-400" />
            <h2 className="text-white text-lg font-bold">Financial Tutor</h2>
          </div>
          <div className="flex items-center gap-1">
            <Button
              onClick={() => adjustWidth(-40)}
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-gray-700 w-8 h-8"
              title="Decrease width"
            >
              <Minimize2 className="size-4" />
            </Button>
            <Button
              onClick={() => adjustWidth(40)}
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-gray-700 w-8 h-8"
              title="Increase width"
            >
              <Maximize2 className="size-4" />
            </Button>
            <Button
              onClick={toggleCollapse}
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-gray-700 w-8 h-8"
              title="Collapse panel"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
        <p className="text-gray-400 text-sm">Ask me to teach you anything about finance</p>
        
        {/* AI Integration Notice */}
        <div className="mt-3 p-2 bg-green-900/30 border border-green-700/50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Bot className="size-3 text-green-400" />
            <span className="text-green-300 text-xs font-medium">AI Tutor Active</span>
          </div>
          <p className="text-green-200/80 text-xs">
            Powered by Google Gemini with speech synthesis. All teachings are saved to your knowledge base.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 border-b border-gray-700 flex-shrink-0">
        <div className="relative">
          <Input
            type="text"
            placeholder="What would you like to learn about?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isGenerating}
            className="w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 pr-12 h-10 focus:outline-none focus:border-green-500 transition-colors"
          />
          <Button
            onClick={handleSearch}
            disabled={!searchQuery.trim() || isGenerating}
            className="absolute right-1 top-1 h-8 w-8 bg-green-600 hover:bg-green-700 disabled:opacity-50"
            size="icon"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] ${message.role === 'user' ? 'ml-4' : 'mr-4'}`}>
              <div
                className={`rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-200 border border-gray-600'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' ? 'bg-green-700' : 'bg-gray-600'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="size-3" />
                    ) : (
                      <Bot className="size-3" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-xs">
                        {message.role === 'user' ? 'You' : 'Tutor'}
                      </span>
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-sm leading-relaxed">
                      {message.role === 'assistant' 
                        ? highlightJargon(message.content)
                        : message.content
                      }
                    </div>
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-1 mt-2">
                        <Button
                          onClick={() => isPlayingAudio === message.id ? stopAudio() : playAudio(message.content, message.id)}
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-gray-400 hover:text-white"
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
                          className="h-6 px-2 text-xs text-gray-400 hover:text-white"
                        >
                          {copiedMessage === message.id ? (
                            <Check className="size-3 mr-1" />
                          ) : (
                            <Copy className="size-3 mr-1" />
                          )}
                          {copiedMessage === message.id ? 'Copied' : 'Copy'}
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
            <div className="max-w-[85%] mr-4">
              <div className="bg-gray-700 text-gray-200 border border-gray-600 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="size-3" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-xs">Tutor</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      <span className="text-sm text-gray-400">Preparing your lesson...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 flex-shrink-0">
        <Button
          onClick={clearTutorChat}
          variant="outline"
          className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white h-10"
        >
          Clear Tutor Chat
        </Button>
        
        <div className="mt-3 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-gray-500">
            <Volume2 className="size-3" />
            <span>Speech synthesis with knowledge base recording</span>
          </div>
        </div>
      </div>
    </div>
  );
};