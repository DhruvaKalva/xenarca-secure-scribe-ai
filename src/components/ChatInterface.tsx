
import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat, type Message } from "@/context/ChatContext";
import { Send, AlertCircle, FileUp, Zap, X } from "lucide-react";
import { formatRelative } from "date-fns";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toast } from "@/components/ui/sonner";

export function ChatInterface() {
  const { currentSession, isProcessing, sendMessage, createNewSession } = useChat();
  const [inputValue, setInputValue] = useState("");
  const [showReasoning, setShowReasoning] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileAttachments, setFileAttachments] = useState<File[]>([]);

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
      // For now, we're not handling file uploads in the actual API call
      // In a real implementation, you'd process these files
      if (fileAttachments.length > 0) {
        // This is where you'd normally upload or process the files
        console.log("Files to upload:", fileAttachments);
        // For now, just show a toast that we received the files
        toast.info(`Attaching ${fileAttachments.length} file(s) to message`);
      }
      
      await sendMessage(inputValue, { showReasoning });
      setInputValue("");
      setFileAttachments([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFileAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFileAttachments(prev => prev.filter((_, i) => i !== index));
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
                    <Avatar className={`h-8 w-8 ${message.error ? "bg-destructive" : "bg-primary"}`}>
                      {message.error ? (
                        <AlertCircle className="h-4 w-4 text-destructive-foreground" />
                      ) : (
                        <span className="text-xs font-bold">AI</span>
                      )}
                    </Avatar>
                  )}
                  
                  <div className="flex flex-col max-w-[80%]">
                    <div
                      className={`rounded-lg px-4 py-2.5 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground ml-auto"
                          : message.error
                          ? "bg-destructive/10 text-destructive border border-destructive/20"
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
              className="max-w-3xl mx-auto flex flex-col gap-2 relative"
            >
              {/* File attachments preview */}
              {fileAttachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2 p-2 bg-secondary/30 rounded-md">
                  {fileAttachments.map((file, index) => (
                    <div key={index} className="flex items-center bg-secondary px-2 py-1 rounded text-xs gap-2">
                      <span className="truncate max-w-[150px]">{file.name}</span>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="h-4 w-4" 
                        onClick={() => removeFile(index)}
                      >
                        <X size={12} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Message input */}
              <div className="relative flex-1">
                <textarea
                  ref={inputRef}
                  className="chat-input min-h-[60px] max-h-[200px] resize-none pr-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
              
              {/* Controls for file attachment and reasoning */}
              <div className="flex items-center justify-between mt-1">
                <div className="flex gap-2">
                  <Button 
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FileUp size={16} className="mr-2" />
                    Attach
                  </Button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileChange}
                    multiple
                  />
                  
                  <ToggleGroup type="single" value={showReasoning ? "on" : "off"}>
                    <ToggleGroupItem 
                      value="off" 
                      onClick={() => setShowReasoning(false)}
                      className={!showReasoning ? 'bg-secondary' : ''}
                    >
                      Standard
                    </ToggleGroupItem>
                    <ToggleGroupItem 
                      value="on" 
                      onClick={() => setShowReasoning(true)}
                      className={showReasoning ? 'bg-secondary' : ''}
                    >
                      <Zap size={16} className="mr-2" />
                      Show Reasoning
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>
            </form>
            <div className="max-w-3xl mx-auto mt-3 text-xs text-center text-muted-foreground">
              XENARCAI may produce inaccurate information. Your conversations are secure.
            </div>
          </div>
        </>
      )}
    </div>
  );
}
