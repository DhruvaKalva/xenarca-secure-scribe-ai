
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { llmService, type LLMResponse } from '../services/llmService';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  content: string;
  role: MessageRole;
  timestamp: number;
  error?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

interface ChatContextType {
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  isProcessing: boolean;
  setCurrentSession: (session: ChatSession | null) => void;
  createNewSession: () => void;
  sendMessage: (content: string) => Promise<void>;
  deleteSession: (sessionId: string) => void;
  clearSessions: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const initialSystemMessage: Message = {
  id: generateId(),
  content: "Hello! I'm XENARCAI. How can I assist you today?",
  role: 'assistant',
  timestamp: Date.now()
};

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load sessions from localStorage on initial render
  useEffect(() => {
    const savedSessions = localStorage.getItem('chat_sessions');
    const currentSessionId = localStorage.getItem('current_session_id');
    
    if (savedSessions) {
      const parsedSessions = JSON.parse(savedSessions) as ChatSession[];
      setSessions(parsedSessions);
      
      if (currentSessionId) {
        const foundSession = parsedSessions.find(session => session.id === currentSessionId);
        if (foundSession) {
          setCurrentSession(foundSession);
        }
      }
    }
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('chat_sessions', JSON.stringify(sessions));
    }
    
    if (currentSession) {
      localStorage.setItem('current_session_id', currentSession.id);
    }
  }, [sessions, currentSession]);

  const createNewSession = useCallback(() => {
    const newSession: ChatSession = {
      id: generateId(),
      title: 'New Chat',
      messages: [initialSystemMessage],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    setSessions(prevSessions => [newSession, ...prevSessions]);
    setCurrentSession(newSession);
    
    return newSession;
  }, []);

  // Convert chat history to format expected by LLM service
  const formatConversationHistory = (messages: Message[]) => {
    return messages
      .filter(msg => msg.role === 'user' || msg.role === 'assistant')
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }));
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    let sessionToUse = currentSession;
    
    if (!sessionToUse) {
      sessionToUse = createNewSession();
    }
    
    try {
      // Add user message
      const userMessage: Message = {
        id: generateId(),
        content,
        role: 'user',
        timestamp: Date.now()
      };
      
      // Update session with user message
      const updatedSession = {
        ...sessionToUse,
        messages: [...sessionToUse.messages, userMessage],
        updatedAt: Date.now(),
        title: sessionToUse.messages.length <= 1 ? content.slice(0, 30) : sessionToUse.title
      };
      
      // Update sessions state
      setSessions(prevSessions => 
        prevSessions.map(session => 
          session.id === updatedSession.id ? updatedSession : session
        )
      );
      setCurrentSession(updatedSession);
      
      // Process AI response
      setIsProcessing(true);
      
      // Prepare conversation history for the LLM
      const conversationHistory = formatConversationHistory(sessionToUse.messages);
      
      // Call the LLM service
      const llmResponse: LLMResponse = await llmService.generateResponse(
        content, 
        conversationHistory
      );
      
      // Add AI response
      const aiResponse: Message = {
        id: generateId(),
        content: llmResponse.success ? llmResponse.content : llmResponse.error || "Sorry, I encountered an error processing your request.",
        role: 'assistant',
        timestamp: Date.now(),
        error: !llmResponse.success
      };
      
      // Update session with AI response
      const finalSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, aiResponse],
        updatedAt: Date.now()
      };
      
      // Update sessions state
      setSessions(prevSessions => 
        prevSessions.map(session => 
          session.id === finalSession.id ? finalSession : session
        )
      );
      setCurrentSession(finalSession);
      
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Add error message if the try-catch fails
      const errorMessage: Message = {
        id: generateId(),
        content: "Sorry, an unexpected error occurred. Please try again later.",
        role: 'assistant',
        timestamp: Date.now(),
        error: true
      };
      
      // Update session with error message
      const errorSession = {
        ...sessionToUse,
        messages: [...sessionToUse.messages, errorMessage],
        updatedAt: Date.now()
      };
      
      setSessions(prevSessions => 
        prevSessions.map(session => 
          session.id === errorSession.id ? errorSession : session
        )
      );
      setCurrentSession(errorSession);
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prevSessions => prevSessions.filter(session => session.id !== sessionId));
    
    if (currentSession?.id === sessionId) {
      const remainingSessions = sessions.filter(session => session.id !== sessionId);
      setCurrentSession(remainingSessions.length > 0 ? remainingSessions[0] : null);
    }
  };

  const clearSessions = () => {
    setSessions([]);
    setCurrentSession(null);
    localStorage.removeItem('chat_sessions');
    localStorage.removeItem('current_session_id');
  };

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
