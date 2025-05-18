
import { useState, useCallback } from 'react';
import { Message, MessageOptions, ChatSession } from '../types/chat';
import { generateId, formatConversationHistory } from '../utils/chatUtils';
import { llmService } from '../services/llmService';

export function useMessageHandler(
  currentSession: ChatSession | null,
  updateSession: (session: ChatSession) => void,
  createNewSession: () => ChatSession
) {
  const [isProcessing, setIsProcessing] = useState(false);

  const sendMessage = useCallback(async (content: string, options: MessageOptions = {}) => {
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
      
      // Update sessions state with user message
      updateSession(updatedSession);
      
      // Process AI response
      setIsProcessing(true);
      
      // Prepare conversation history for the LLM
      const conversationHistory = formatConversationHistory(sessionToUse.messages);
      
      // Call the LLM service with the reasoning option
      const llmResponse = await llmService.generateResponse(
        content, 
        conversationHistory,
        {
          // Pass the showReasoning option to the LLM service
          systemPrompt: options.showReasoning 
            ? "You are XENARCAI, a helpful AI assistant. Please show your reasoning step by step before providing your final answer."
            : undefined
        }
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
      
      // Update sessions state with AI response
      updateSession(finalSession);
      
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
      
      updateSession(errorSession);
    } finally {
      setIsProcessing(false);
    }
  }, [currentSession, updateSession, createNewSession]);

  return {
    isProcessing,
    sendMessage
  };
}
