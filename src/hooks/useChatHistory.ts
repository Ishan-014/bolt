import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface ChatSession {
  id: string;
  title: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    type?: 'text' | 'voice';
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export function useChatHistory() {
  const { user } = useAuth();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Load chat history from localStorage on mount
  useEffect(() => {
    if (user) {
      loadChatHistory();
    }
  }, [user]);

  const loadChatHistory = () => {
    if (!user) return;

    try {
      const savedHistory = localStorage.getItem(`chat-history-${user.id}`);
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        // Convert date strings back to Date objects
        const sessions = parsed.map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setChatSessions(sessions);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const saveChatHistory = (sessions: ChatSession[]) => {
    if (!user) return;

    try {
      localStorage.setItem(`chat-history-${user.id}`, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  };

  const createNewSession = (title?: string): string => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: title || `Chat ${new Date().toLocaleDateString()}`,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedSessions = [newSession, ...chatSessions];
    setChatSessions(updatedSessions);
    saveChatHistory(updatedSessions);
    setCurrentSessionId(newSession.id);
    
    return newSession.id;
  };

  const updateSession = (sessionId: string, messages: ChatSession['messages']) => {
    const updatedSessions = chatSessions.map(session => {
      if (session.id === sessionId) {
        // Auto-generate title from first user message if not set
        let title = session.title;
        if (title.startsWith('Chat ') && messages.length > 0) {
          const firstUserMessage = messages.find(msg => msg.role === 'user');
          if (firstUserMessage) {
            title = firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '');
          }
        }

        return {
          ...session,
          title,
          messages,
          updatedAt: new Date()
        };
      }
      return session;
    });

    setChatSessions(updatedSessions);
    saveChatHistory(updatedSessions);
  };

  const deleteSession = (sessionId: string) => {
    const updatedSessions = chatSessions.filter(session => session.id !== sessionId);
    setChatSessions(updatedSessions);
    saveChatHistory(updatedSessions);
    
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
    }
  };

  const loadSession = (sessionId: string): ChatSession | null => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      return session;
    }
    return null;
  };

  const getCurrentSession = (): ChatSession | null => {
    if (!currentSessionId) return null;
    return chatSessions.find(s => s.id === currentSessionId) || null;
  };

  const clearAllHistory = () => {
    setChatSessions([]);
    setCurrentSessionId(null);
    if (user) {
      localStorage.removeItem(`chat-history-${user.id}`);
    }
  };

  return {
    chatSessions,
    currentSessionId,
    createNewSession,
    updateSession,
    deleteSession,
    loadSession,
    getCurrentSession,
    clearAllHistory,
    setCurrentSessionId
  };
}