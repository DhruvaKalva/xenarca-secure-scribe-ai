
import { useState, useCallback } from 'react';
import { ChatSession } from '../types/chat';
import { generateId, createInitialSystemMessage } from '../utils/chatUtils';
import { useLocalStorage } from './useLocalStorage';

export function useSessionManager() {
  const [sessions, setSessions] = useLocalStorage<ChatSession[]>('chat_sessions', []);
  const [currentSession, setCurrentSession] = useLocalStorage<ChatSession | null>('current_session_id', null);

  const createNewSession = useCallback(() => {
    const newSession: ChatSession = {
      id: generateId(),
      title: 'New Chat',
      messages: [createInitialSystemMessage()],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    setSessions(prevSessions => [newSession, ...(prevSessions || [])]);
    setCurrentSession(newSession);
    
    return newSession;
  }, [setSessions, setCurrentSession]);

  const updateSession = useCallback((updatedSession: ChatSession) => {
    setSessions(prevSessions => 
      (prevSessions || []).map(session => 
        session.id === updatedSession.id ? updatedSession : session
      )
    );
    
    if (currentSession?.id === updatedSession.id) {
      setCurrentSession(updatedSession);
    }
  }, [setSessions, setCurrentSession, currentSession]);

  const deleteSession = useCallback((sessionId: string) => {
    const remainingSessions = (sessions || []).filter(session => session.id !== sessionId);
    setSessions(remainingSessions);
    
    if (currentSession?.id === sessionId) {
      setCurrentSession(remainingSessions.length > 0 ? remainingSessions[0] : null);
    }
  }, [sessions, setSessions, currentSession, setCurrentSession]);

  const clearSessions = useCallback(() => {
    setSessions([]);
    setCurrentSession(null);
  }, [setSessions, setCurrentSession]);

  return {
    sessions: sessions || [],
    currentSession,
    setCurrentSession,
    createNewSession,
    updateSession,
    deleteSession,
    clearSessions
  };
}
