
import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat, type Message } from "@/context/ChatContext";
import { Send } from "lucide-react";
import { formatRelative } from "date-fns";

export function ChatInterface() {
  const { currentSession, isProcessing, sendMessage, createNewSession } = useChat();
  const [inputValue, setInputValue] = React.useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current;
      scrollElement.scrollTop = scrollElement.scrollHeight;
    }
  }, [currentSession?.messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isProcessing) {
      await sendMessage(inputValue);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return formatRelative(new Date(timestamp), new Date());
  };

  const renderMessageContent = (content: string) => {
    return content.split("\n").map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < content.split("\n").length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className="flex flex-col h-full relative">
      {!currentSession ? (
        <div className="flex items-center justify-center h-full w-full">
          <div className="max-w-md text-center">
            <h2 className="text-2xl font-bold mb-4">Welcome to XENARCAI</h2>
            <p className="text-muted-foreground mb-6">
              Your secure AI assistant with advanced capabilities and privacy protection.
            </p>
            <Button onClick={createNewSession}>Start a new chat</Button>
          </div>
        </div>
      ) : (
        <>
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
            <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-20">
              {currentSession.messages.map((message: Message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role !== "user" && (
                    <Avatar className="h-8 w-8 bg-primary">
                      <span className="text-xs font-bold">AI</span>
                    </Avatar>
                  )}
                  
                  <div className="flex flex-col max-w-[80%]">
                    <div
                      className={`rounded-lg px-4 py-2.5 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground ml-auto"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {renderMessageContent(message.content)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 px-1">
                      {formatTimestamp(message.timestamp)}
                    </div>
                  </div>
                  
                  {message.role === "user" && (
                    <Avatar className="h-8 w-8 bg-muted">
                      <span className="text-xs font-bold">U</span>
                    </Avatar>
                  )}
                </div>
              ))}
              
              {isProcessing && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 bg-primary">
                    <span className="text-xs font-bold">AI</span>
                  </Avatar>
                  <div className="typing-indicator">
                    <div className="typing-dot" style={{ animationDelay: "0s" }}></div>
                    <div className="typing-dot" style={{ animationDelay: "0.2s" }}></div>
                    <div className="typing-dot" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-6">
            <form
              onSubmit={handleSubmit}
              className="max-w-3xl mx-auto flex items-end gap-2 relative"
            >
              <div className="relative flex-1">
                <textarea
                  ref={inputRef}
                  className="chat-input min-h-[60px] max-h-[200px] resize-none pr-12"
                  placeholder="Message XENARCAI..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  style={{
                    height: "60px",
                    overflowY: inputValue.split("\n").length > 3 ? "auto" : "hidden"
                  }}
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-2 bottom-2.5"
                  disabled={!inputValue.trim() || isProcessing}
                >
                  <Send size={18} />
                  <span className="sr-only">Send</span>
                </Button>
              </div>
            </form>
            <div className="max-w-3xl mx-auto mt-2 text-xs text-center text-muted-foreground">
              XENARCAI may produce inaccurate information. Your conversations are secure.
            </div>
          </div>
        </>
      )}
    </div>
  );
}
