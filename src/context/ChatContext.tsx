
import React, { createContext, useContext } from 'react';
import { ChatSession, Message, MessageOptions } from '../types/chat';
import { useSessionManager } from '../hooks/useSessionManager';
import { useMessageHandler } from '../hooks/useMessageHandler';

interface ChatContextType {
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  isProcessing: boolean;
  setCurrentSession: (session: ChatSession | null) => void;
  createNewSession: () => void;
  sendMessage: (content: string, options?: MessageOptions) => Promise<void>;
  deleteSession: (sessionId: string) => void;
  clearSessions: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { 
    sessions, 
    currentSession, 
    setCurrentSession, 
    createNewSession,
    updateSession, 
    deleteSession, 
    clearSessions 
  } = useSessionManager();
  
  const { isProcessing, sendMessage } = useMessageHandler(
    currentSession, 
    updateSession, 
    createNewSession
  );

  return (
    <ChatContext.Provider
      value={{
        currentSession,
        sessions,
        isProcessing,
        setCurrentSession,
        createNewSession,
        sendMessage,
        deleteSession,
        clearSessions
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export type { Message, ChatSession, MessageOptions, MessageRole } from '../types/chat';
