import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
  confidence: number;
}

interface UseSpeechRecognitionProps {
  onResult?: (result: SpeechRecognitionResult) => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
  language?: string;
  continuous?: boolean;
}

export function useSpeechRecognition({
  onResult,
  onEnd,
  onError,
  language = 'en-US',
  continuous = true
}: UseSpeechRecognitionProps = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    console.log('Checking speech recognition support:', !!SpeechRecognition);
    
    if (SpeechRecognition) {
      setIsSupported(true);
      
      const recognition = new SpeechRecognition();
      recognition.continuous = continuous;
      recognition.interimResults = true;
      recognition.lang = language;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        console.log('Speech recognition result:', event);
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;

          if (result.isFinal) {
            finalTranscript += transcript;
            console.log('Final transcript:', finalTranscript);
          } else {
            interimTranscript += transcript;
            console.log('Interim transcript:', interimTranscript);
          }
        }

        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript);
          onResult?.({
            transcript: finalTranscript,
            isFinal: true,
            confidence: event.results[event.results.length - 1][0].confidence || 0
          });
        }

        setInterimTranscript(interimTranscript);
        if (interimTranscript) {
          onResult?.({
            transcript: interimTranscript,
            isFinal: false,
            confidence: 0
          });
        }
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
        setInterimTranscript('');
        onEnd?.();
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setInterimTranscript('');
        
        let errorMessage = 'Speech recognition error';
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try speaking again.';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone not accessible. Please check permissions.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone permission denied.';
            break;
          case 'network':
            errorMessage = 'Network error occurred during speech recognition.';
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }
        
        onError?.(errorMessage);
      };

      recognitionRef.current = recognition;
    } else {
      console.warn('Speech recognition not supported in this browser');
      setIsSupported(false);
      onError?.('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language, continuous, onResult, onEnd, onError]);

  const startListening = useCallback(() => {
    console.log('Attempting to start listening...', { isSupported, isListening });
    if (recognitionRef.current && !isListening && isSupported) {
      try {
        setTranscript('');
        setInterimTranscript('');
        recognitionRef.current.start();
        console.log('Speech recognition start() called');
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        onError?.('Failed to start speech recognition');
      }
    } else if (!isSupported) {
      onError?.('Speech recognition is not supported in this browser');
    }
  }, [isListening, isSupported, onError]);

  const stopListening = useCallback(() => {
    console.log('Stopping speech recognition...');
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    console.log('Resetting transcript');
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript
  };
}

// Extend the Window interface to include speech recognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}