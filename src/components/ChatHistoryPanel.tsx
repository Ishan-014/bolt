import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  History, 
  MessageCircle, 
  Search, 
  Plus, 
  X, 
  Calendar,
  ChevronRight
} from 'lucide-react';
import { ChatSession } from '@/hooks/useChatHistory';
import { cn } from '@/lib/utils';

interface ChatHistoryPanelProps {
  chatSessions: ChatSession[];
  currentSessionId: string | null;
  onLoadSession: (sessionId: string) => void;
  onNewSession: () => void;
  onClose: () => void;
}

export const ChatHistoryPanel: React.FC<ChatHistoryPanelProps> = ({
  chatSessions,
  currentSessionId,
  onLoadSession,
  onNewSession,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSessions = chatSessions.filter(session =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.messages.some(msg => 
      msg.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getMessagePreview = (session: ChatSession) => {
    const lastUserMessage = session.messages
      .filter(msg => msg.role === 'user')
      .pop();
    
    if (lastUserMessage) {
      return lastUserMessage.content.slice(0, 60) + (lastUserMessage.content.length > 60 ? '...' : '');
    }
    
    return 'No messages yet';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Chat History</h2>
          <p className="text-gray-400 text-sm">Your conversation sessions with FinIQ.ai</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={onNewSession}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            <Plus className="size-4 mr-2" />
            New Chat
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            size="icon"
            className="border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
        <Input
          type="text"
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 pl-10 focus:outline-none focus:border-green-500 transition-colors"
        />
      </div>

      {/* Chat Sessions List */}
      <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-12">
            <History className="size-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400 text-lg mb-2">
              {searchTerm ? 'No conversations match your search' : 'No chat history yet'}
            </p>
            <p className="text-gray-500 text-sm">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Start a conversation to see your chat history here'
              }
            </p>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <div
              key={session.id}
              onClick={() => onLoadSession(session.id)}
              className={cn(
                "bg-gray-800 border rounded-lg p-4 hover:bg-gray-700 transition-all duration-200 cursor-pointer group",
                currentSessionId === session.id 
                  ? "border-green-600 bg-green-900/20" 
                  : "border-gray-700"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="p-2 bg-green-600/20 rounded-lg flex-shrink-0">
                    <MessageCircle className="size-4 text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium text-sm mb-1 truncate">
                      {session.title}
                    </h3>
                    <p className="text-gray-400 text-xs mb-2 line-clamp-2">
                      {getMessagePreview(session)}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        <span>{formatDate(session.updatedAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="size-3" />
                        <span>{session.messages.length} messages</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 ml-2">
                  {currentSessionId === session.id && (
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  )}
                  <ChevronRight className="size-4 text-gray-400 group-hover:text-white transition-colors" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      {chatSessions.length > 0 && (
        <div className="border-t border-gray-700 pt-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
              <div className="text-white text-lg font-bold">{chatSessions.length}</div>
              <div className="text-gray-400 text-xs">Total Chats</div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
              <div className="text-white text-lg font-bold">
                {chatSessions.reduce((total, session) => total + session.messages.length, 0)}
              </div>
              <div className="text-gray-400 text-xs">Total Messages</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};