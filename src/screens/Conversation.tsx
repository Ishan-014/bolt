import {
  DailyAudio,
  useDaily,
  useLocalSessionId,
  useParticipantIds,
  useVideoTrack,
  useAudioTrack,
} from "@daily-co/daily-react";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import Video from "@/components/Video";
import { conversationAtom } from "@/store/conversation";
import { useAtom, useAtomValue } from "jotai";
import { screenAtom } from "@/store/screens";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { endConversation, createConversation } from "@/api";
import {
  MicIcon,
  MicOffIcon,
  VideoIcon,
  VideoOffIcon,
  PhoneIcon,
  Send,
  Settings,
  Mic,
  Camera,
  AlertTriangle,
  Home,
} from "lucide-react";
import {
  clearSessionTime,
  getSessionTime,
  setSessionStartTime,
  updateSessionEndTime,
} from "@/utils";
import { Timer } from "@/components/Timer";
import { TIME_LIMIT } from "@/config";
import { niceScoreAtom } from "@/store/game";
import { naughtyScoreAtom } from "@/store/game";
import { apiTokenAtom } from "@/store/tokens";
import { quantum } from 'ldrs';
import { cn } from "@/lib/utils";
import { UserStats } from "@/components/UserStats";
import { JargonGuide } from "@/components/JargonGuide";
import { useDevices } from "@daily-co/daily-react";
import zoomSound from "@/assets/sounds/zoom.mp3";

quantum.register();

const timeToGoPhrases = [
  "I'll need to wrap up our financial discussion soon—let's focus on your most important questions.",
  "We're approaching the end of our session, but I have time for a few more financial insights!",
  "Our consultation time is almost up, but I'd love to address one more financial concern before we finish!",
];

const outroPhrases = [
  "Thank you for this financial consultation. Keep implementing what we discussed, and I'll see you soon!",
  "Our session is complete. Remember to review your financial goals regularly. Take care!",
  "Great discussion about your finances today. Stay disciplined with your plan, and I'll see you next time!",
];

export const Conversation: React.FC = () => {
  const [conversation, setConversation] = useAtom(conversationAtom);
  const [, setScreenState] = useAtom(screenAtom);
  const [naughtyScore] = useAtom(naughtyScoreAtom);
  const [niceScore] = useAtom(niceScoreAtom);
  const [token, setToken] = useAtom(apiTokenAtom);

  const daily = useDaily();
  const { currentMic, setMicrophone, setSpeaker } = useDevices();
  const localSessionId = useLocalSessionId();
  const localVideo = useVideoTrack(localSessionId);
  const localAudio = useAudioTrack(localSessionId);
  const isCameraEnabled = !localVideo.isOff;
  const isMicEnabled = !localAudio.isOff;
  const remoteParticipantIds = useParticipantIds({ filter: "remote" });
  const [start, setStart] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [hasMediaAccess, setHasMediaAccess] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [isListening, setIsListening] = useState(false);

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
    if (!remoteParticipantIds.length || !start) return;

    setSessionStartTime();
    const interval = setInterval(() => {
      const time = getSessionTime();
      if (time === TIME_LIMIT - 60) {
        daily?.sendAppMessage({
          message_type: "conversation",
          event_type: "conversation.echo",
          conversation_id: conversation?.conversation_id,
          properties: {
            modality: "text",
            text:
              timeToGoPhrases[Math.floor(Math.random() * 3)] ??
              timeToGoPhrases[0],
          },
        });
      }
      if (time === TIME_LIMIT - 10) {
        daily?.sendAppMessage({
          message_type: "conversation",
          event_type: "conversation.echo",
          conversation_id: conversation?.conversation_id,
          properties: {
            modality: "text",
            text:
              outroPhrases[Math.floor(Math.random() * 3)] ?? outroPhrases[0],
          },
        });
      }
      if (time >= TIME_LIMIT) {
        restartConversation();
        clearInterval(interval);
      } else {
        updateSessionEndTime();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [remoteParticipantIds, start]);

  useEffect(() => {
    if (conversation?.conversation_url) {
      daily
        ?.join({
          url: conversation.conversation_url,
          startVideoOff: false,
          startAudioOff: true,
        })
        .then(() => {
          daily?.setLocalVideo(true);
          daily?.setLocalAudio(false);
        });
    }
  }, [conversation?.conversation_url]);

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
    } finally {
      setIsStarting(false);
    }
  };

  const restartConversation = useCallback(async () => {
    // End current conversation
    if (conversation?.conversation_id && token) {
      await endConversation(token, conversation.conversation_id);
    }
    daily?.leave();
    setConversation(null);
    clearSessionTime();
    setStart(false);
    
    // Start new conversation after a brief delay
    setTimeout(() => {
      if (hasMediaAccess && token) {
        createConversation(token).then(setConversation);
      }
    }, 2000);
  }, [daily, token, conversation, hasMediaAccess]);

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
      // Enable microphone for voice input
      daily?.setLocalAudio(true);
      
      // Auto-disable after 10 seconds
      setTimeout(() => {
        setIsListening(false);
      }, 10000);
    }
  }, [daily, hasMediaAccess]);

  const stopVoiceRecording = useCallback(() => {
    setIsListening(false);
  }, []);

  const openSettings = () => {
    setScreenState({ currentScreen: "settings" });
  };

  const goToHomepage = () => {
    setScreenState({ currentScreen: "homepage" });
  };

  // Media access request screen
  if (!hasMediaAccess) {
    return (
      <div className="flex h-full w-full">
        <UserStats />
        <div className="flex-1 relative flex items-center justify-center bg-black">
          <div className="text-center max-w-md">
            {isStarting ? (
              <>
                <l-quantum
                  size="45"
                  speed="1.75"
                  color="white"
                ></l-quantum>
                <p className="text-white text-lg mt-4">Requesting access...</p>
              </>
            ) : (
              <>
                <div className="mb-8">
                  <h1 className="text-white text-2xl font-bold mb-4">
                    Start Your Financial Consultation
                  </h1>
                  <p className="text-white/70 text-base mb-8">
                    To begin your video call with your AI financial mentor, please grant access to your camera and microphone.
                  </p>
                </div>

                <div className="flex flex-col gap-4 mb-8">
                  <div className="flex items-center gap-4 bg-black/20 border border-white/10 rounded-lg p-4">
                    <div className="bg-primary/20 p-3 rounded-full">
                      <Camera className="size-6 text-primary" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-white font-semibold">Camera Access</h3>
                      <p className="text-white/60 text-sm">Required for video consultation</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-black/20 border border-white/10 rounded-lg p-4">
                    <div className="bg-primary/20 p-3 rounded-full">
                      <Mic className="size-6 text-primary" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-white font-semibold">Microphone Access</h3>
                      <p className="text-white/60 text-sm">Required for voice interaction</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={requestMediaAccess}
                  className="bg-primary hover:bg-primary/80 text-white px-8 py-3 rounded-full font-semibold text-lg h-auto"
                  disabled={isStarting}
                >
                  <Camera className="size-5 mr-2" />
                  <Mic className="size-5 mr-3" />
                  Enable Camera & Microphone
                </Button>

                {mediaError && (
                  <div className="mt-6 flex items-center gap-2 text-wrap rounded-lg border bg-red-500/20 border-red-500/50 p-4 text-red-200 backdrop-blur-sm">
                    <AlertTriangle className="size-5 flex-shrink-0" />
                    <p className="text-sm">{mediaError}</p>
                  </div>
                )}

                <div className="mt-8 text-white/50 text-sm">
                  <p>Your privacy is protected. Media access is only used for this consultation.</p>
                </div>
              </>
            )}
          </div>
        </div>
        <JargonGuide />
      </div>
    );
  }

  // Loading state while starting conversation
  if (isStarting || !conversation) {
    return (
      <div className="flex h-full w-full">
        <UserStats />
        <div className="flex-1 relative flex items-center justify-center bg-black">
          <div className="text-center">
            <l-quantum
              size="45"
              speed="1.75"
              color="white"
            ></l-quantum>
            <p className="text-white text-lg mt-4">Connecting to your financial mentor...</p>
          </div>
        </div>
        <JargonGuide />
      </div>
    );
  }

  // Active conversation interface
  return (
    <div className="flex h-full w-full">
      {/* Left Sidebar - User Stats */}
      <UserStats />
      
      {/* Main Video Area - Full Screen */}
      <div className="flex-1 relative bg-black">
        <div className="absolute inset-0 size-full">
          {remoteParticipantIds?.length > 0 ? (
            <>
              <Timer />
              <Video
                id={remoteParticipantIds[0]}
                className="size-full"
                tileClassName="!object-cover"
              />
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <l-quantum
                  size="45"
                  speed="1.75"
                  color="white"
                ></l-quantum>
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

          {/* Top Controls */}
          <div className="absolute top-6 right-6 flex gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={goToHomepage}
              className="size-12 border-0 bg-black/40 backdrop-blur-sm hover:bg-black/60"
            >
              <Home className="size-6" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={openSettings}
              className="size-12 border-0 bg-black/40 backdrop-blur-sm hover:bg-black/60"
            >
              <Settings className="size-6" />
            </Button>
          </div>

          {/* Chat Interface - Bottom */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-white/10 p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3">
                {/* Text Input */}
                <div className="flex-1 relative">
                  <Input
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your financial question or use voice..."
                    className="bg-black/40 border-white/20 text-white placeholder-white/60 pr-12 h-12 rounded-full"
                    style={{ fontFamily: "'Source Code Pro', monospace" }}
                  />
                  <Button
                    onClick={sendTextMessage}
                    disabled={!chatMessage.trim()}
                    className="absolute right-1 top-1 h-10 w-10 rounded-full bg-primary hover:bg-primary/80 disabled:opacity-50"
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
                    "h-12 w-12 rounded-full transition-all duration-200",
                    isListening 
                      ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                      : "bg-primary hover:bg-primary/80"
                  )}
                  size="icon"
                >
                  <Mic className="size-5" />
                </Button>

                {/* Video Controls */}
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    className="h-12 w-12 rounded-full border border-white/20 bg-black/40 backdrop-blur-sm hover:bg-black/60"
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
                    className="h-12 w-12 rounded-full border border-white/20 bg-black/40 backdrop-blur-sm hover:bg-black/60"
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
                    className="h-12 w-12 rounded-full bg-[rgba(251,36,71,0.80)] backdrop-blur hover:bg-[rgba(251,36,71,0.60)] border border-[rgba(251,36,71,0.9)]"
                    variant="secondary"
                    onClick={restartConversation}
                  >
                    <PhoneIcon className="size-5 rotate-[135deg]" />
                  </Button>
                </div>
              </div>

              {/* Instructions */}
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-white/60 justify-center">
                <span>💬 Type your question and press Enter</span>
                <span>🎤 Hold voice button to speak</span>
                <span>📞 Red button restarts conversation</span>
                <span>🏠 Home button returns to homepage</span>
              </div>
            </div>
          </div>

          <DailyAudio />
        </div>
      </div>

      {/* Right Sidebar - Jargon Guide */}
      <JargonGuide />
    </div>
  );
};