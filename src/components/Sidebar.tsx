
import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { sessions, currentSession, setCurrentSession, createNewSession, deleteSession } = useChat();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const handleSessionClick = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
      if (isMobile) onClose();
    }
  };

  const handleNewChat = () => {
    createNewSession();
    if (isMobile) onClose();
  };

  if (!user) {
    return null;
  }

  return (
    <aside 
      className={`glass-panel flex flex-col w-80 h-[calc(100vh-2rem)] fixed left-0 top-[1rem] bottom-0 z-40 transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 lg:relative lg:z-0`}
    >
      <div className="p-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Chats</h2>
        {isMobile && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        )}
      </div>
      
      <Button 
        className="mx-4 mb-2 flex gap-2" 
        onClick={handleNewChat}
      >
        <Plus size={16} /> New Chat
      </Button>
      
      <Separator className="my-2" />
      
      <ScrollArea className="flex-1 px-1">
        <div className="p-2 flex flex-col gap-1">
          {sessions.length === 0 ? (
            <div className="text-sm text-muted-foreground py-8 text-center">
              No chat history yet
            </div>
          ) : (
            sessions.map((session) => (
              <Button
                key={session.id}
                variant={currentSession?.id === session.id ? "secondary" : "ghost"}
                className={`justify-start text-left h-auto py-3 px-3 ${
                  currentSession?.id === session.id ? "bg-accent" : ""
                }`}
                onClick={() => handleSessionClick(session.id)}
              >
                <div className="flex items-start gap-3 w-full overflow-hidden">
                  <MessageSquare size={16} className="shrink-0 mt-1" />
                  <div className="truncate flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {session.title || "New Chat"}
                    </div>
                    <div className="text-xs text-muted-foreground truncate mt-1">
                      {formatDistanceToNow(session.updatedAt, { addSuffix: true })}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}
                  >
                    <Trash2 size={14} />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </Button>
            ))
          )}
        </div>
      </ScrollArea>

      <Separator className="my-2" />
      
      <div className="p-4">
        <div className="text-sm text-muted-foreground">
          XENARCAI © {new Date().getFullYear()}
        </div>
      </div>
    </aside>
  );
}
