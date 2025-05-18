
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sidebar } from "@/components/Sidebar";
import { ChatInterface } from "@/components/ChatInterface";
import { UserMenu } from "@/components/UserMenu";
import { AuthForms } from "@/components/AuthForms";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">XENARCAI</h2>
          <div className="typing-indicator mx-auto">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b py-3 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-xl font-bold">XENARCAI</h1>
            <ThemeToggle />
          </div>
        </header>
        
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <AuthForms />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full relative overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_120%,var(--primary),var(--background)_60%)] opacity-10" />
      
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 px-4 h-[60px] flex items-center sticky top-0 z-30">
          <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-2">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu />
                <span className="sr-only">Open sidebar</span>
              </Button>
            )}
            
            <h1 className="text-xl font-bold whitespace-nowrap">XENARCAI</h1>
            
            <div className="flex items-center gap-2 ml-auto">
              <ThemeToggle />
              <UserMenu />
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-hidden">
          <ChatInterface />
        </main>
      </div>
    </div>
  );
};

export default Index;
