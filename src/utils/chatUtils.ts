
import { Message } from "../types/chat";

// Generate unique IDs for messages and sessions
export const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Format conversation history for the LLM service
export const formatConversationHistory = (messages: Message[]) => {
  return messages
    .filter(msg => msg.role === 'user' || msg.role === 'assistant')
    .map(msg => ({
      role: msg.role,
      content: msg.content
    }));
};

// Create initial system message
export const createInitialSystemMessage = (): Message => ({
  id: generateId(),
  content: "Hello! I'm XENARCAI. How can I assist you today?",
  role: 'assistant',
  timestamp: Date.now()
});
