
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  content: string;
  role: MessageRole;
  timestamp: number;
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

  const getAIResponse = async (userMessage: string): Promise<string> => {
    // This is where you would normally call your AI API
    // For demo purposes, we'll simulate a delay and return a mock response
    
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    const responses = [
      "I'm XENARCAI, a secure AI assistant. How can I help you today?",
      "That's an interesting question. Let me think about that...",
      "I'm designed to provide helpful, harmless, and honest responses.",
      "I don't have personal opinions, but I can provide information on that topic.",
      "I'm always learning and improving to better assist users like you.",
      "My code is securely protected to prevent unauthorized access.",
      "I process information quickly, but I don't store your personal data.",
      "Great question! Let me explain that in more detail...",
      "I'm programmed to respect privacy and confidentiality.",
      "I can help with a wide range of topics. What else would you like to know?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
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
      const aiResponseContent = await getAIResponse(content);
      
      // Add AI response
      const aiResponse: Message = {
        id: generateId(),
        content: aiResponseContent,
        role: 'assistant',
        timestamp: Date.now()
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
