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
  if (!isListening && !transcript && !interimTranscript) {
    return null;
  }

  return (
    <div className={cn(
      "bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-4 max-w-md",
      className
    )}>
      <div className="flex items-center gap-2 mb-2">
        {isListening ? (
          <Mic className="size-4 text-red-400 animate-pulse" />
        ) : (
          <MicOff className="size-4 text-gray-400" />
        )}
        <span className="text-white text-sm font-medium">
          {isListening ? 'Listening...' : 'Voice Input'}
        </span>
      </div>
      
      <div className="text-white text-sm leading-relaxed">
        {/* Final transcript */}
        {transcript && (
          <span className="text-green-300">{transcript}</span>
        )}
        
        {/* Interim transcript (real-time) */}
        {interimTranscript && (
          <span className="text-gray-300 italic">
            {transcript && ' '}
            {interimTranscript}
            <span className="animate-pulse">|</span>
          </span>
        )}
        
        {/* Placeholder when listening but no speech yet */}
        {isListening && !transcript && !interimTranscript && (
          <span className="text-gray-400 italic">
            Start speaking...
            <span className="animate-pulse">|</span>
          </span>
        )}
      </div>
    </div>
  );
};