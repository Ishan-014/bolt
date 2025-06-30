import React, { useState, useRef, useEffect } from 'react';
import { Search, BookOpen, Volume2, VolumeX, Loader2, Send, Copy, Check, Mic, Bot, User } from 'lucide-react';
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
}

export const FinancialTutor: React.FC<FinancialTutorProps> = ({ className }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      console.log('Attempting to play audio for message:', messageId);

      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/XrExE9yKIg1WjnnlVkGX', {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': 'sk_83a44420464c52474ba9830b9613b5ac20d47031117995a9'
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        })
      });

      console.log('ElevenLabs API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ElevenLabs API error response:', errorText);
        throw new Error(`ElevenLabs API error: ${response.status} - ${response.statusText}`);
      }

      const audioBlob = await response.blob();
      console.log('Audio blob size:', audioBlob.size);
      
      if (audioBlob.size === 0) {
        throw new Error('Received empty audio response');
      }

      const audioUrl = URL.createObjectURL(audioBlob);
      console.log('Created audio URL:', audioUrl);
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Set up event listeners
      audio.onloadstart = () => console.log('Audio loading started');
      audio.oncanplay = () => console.log('Audio can start playing');
      audio.onplay = () => console.log('Audio playback started');

      audio.onended = () => {
        console.log('Audio playback ended');
        setIsPlayingAudio(null);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        setIsPlayingAudio(null);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
        throw new Error('Audio playback failed');
      };

      // Attempt to play
      console.log('Starting audio playback...');
      await audio.play();
      console.log('Audio playback started successfully');

    } catch (error) {
      console.error('Error in playAudio function:', error);
      setIsPlayingAudio(null);
      
      // More specific error messages
      let errorMessage = 'Failed to play audio. ';
      if (error instanceof Error) {
        if (error.message.includes('API error')) {
          errorMessage += 'There was an issue with the text-to-speech service.';
        } else if (error.message.includes('playback failed')) {
          errorMessage += 'Your browser may not support audio playback.';
        } else if (error.message.includes('empty audio')) {
          errorMessage += 'No audio was generated for this text.';
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += 'Please check your internet connection and try again.';
      }
      
      alert(errorMessage);
    }
  };

  const stopAudio = () => {
    console.log('Stopping audio playback');
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
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

  return (
    <div className={cn("w-80 bg-gray-800 border-l border-gray-700 flex flex-col overflow-hidden", className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="size-5 text-green-400" />
          <h2 className="text-white text-xl font-bold">Financial Tutor</h2>
        </div>
        <p className="text-gray-400 text-sm">Ask me to teach you anything about finance</p>
        
        {/* AI Integration Notice */}
        <div className="mt-3 p-2 bg-green-900/30 border border-green-700/50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Bot className="size-3 text-green-400" />
            <span className="text-green-300 text-xs font-medium">AI Tutor Active</span>
          </div>
          <p className="text-green-200/80 text-xs">
            Powered by Google Gemini with ElevenLabs voice synthesis
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
            className="w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 pr-12 focus:outline-none focus:border-green-500 transition-colors"
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
          className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
        >
          Clear Tutor Chat
        </Button>
        
        <div className="mt-3 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-gray-500">
            <Volume2 className="size-3" />
            <span>Powered by ElevenLabs TTS</span>
          </div>
        </div>
      </div>
    </div>
  );
};