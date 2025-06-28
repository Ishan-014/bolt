import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceTranscriptProps {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  className?: string;
}

export const VoiceTranscript: React.FC<VoiceTranscriptProps> = ({
  isListening,
  transcript,
  interimTranscript,
  className
}) => {
  // Always show when listening or when there's any text
  const shouldShow = isListening || transcript || interimTranscript;
  
  if (!shouldShow) {
    return null;
  }

  return (
    <div className={cn(
      "bg-black/90 backdrop-blur-sm border border-green-500/50 rounded-lg p-4 max-w-sm shadow-lg",
      className
    )}>
      <div className="flex items-center gap-2 mb-3">
        {isListening ? (
          <Mic className="size-4 text-red-400 animate-pulse" />
        ) : (
          <MicOff className="size-4 text-gray-400" />
        )}
        <span className="text-white text-sm font-medium">
          {isListening ? 'Listening...' : 'Voice Input'}
        </span>
        {isListening && (
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-red-400 rounded-full animate-bounce"></div>
            <div className="w-1 h-1 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-1 h-1 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        )}
      </div>
      
      <div className="text-white text-sm leading-relaxed min-h-[20px]">
        {/* Final transcript */}
        {transcript && (
          <span className="text-green-300 font-medium">{transcript}</span>
        )}
        
        {/* Interim transcript (real-time) */}
        {interimTranscript && (
          <span className="text-gray-300 italic">
            {transcript && ' '}
            {interimTranscript}
            <span className="animate-pulse text-green-400">|</span>
          </span>
        )}
        
        {/* Placeholder when listening but no speech yet */}
        {isListening && !transcript && !interimTranscript && (
          <span className="text-gray-400 italic">
            Start speaking...
            <span className="animate-pulse text-green-400">|</span>
          </span>
        )}
        
        {/* Show when not listening and no text */}
        {!isListening && !transcript && !interimTranscript && (
          <span className="text-gray-500 text-xs">
            Click microphone to start voice input
          </span>
        )}
      </div>
    </div>
  );
};