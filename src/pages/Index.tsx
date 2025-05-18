
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
  const [showLoginForm, setShowLoginForm] = useState(false);
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
        <header className="border-b py-3 px-4 bg-background/80 backdrop-blur-sm fixed w-full z-10">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-xl font-bold">XENARCAI</h1>
            <div className="flex items-center gap-3">
              {!showLoginForm && (
                <Button variant="default" onClick={() => setShowLoginForm(true)}>
                  Sign In
                </Button>
              )}
              <ThemeToggle />
            </div>
          </div>
        </header>
        
        <main className="flex-1">
          {/* Hero section */}
          <section className="min-h-screen flex flex-col items-center justify-center p-4 relative">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_120%,var(--primary),var(--background)_60%)] opacity-20" />
            <h1 className="text-5xl md:text-6xl font-bold text-center mb-4 bg-gradient-to-r from-primary to-xenarcai-blue bg-clip-text text-transparent">
              XENARCAI
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-center mb-8">NEW ERA OF AI</h2>
            <p className="text-center max-w-lg mb-8 text-muted-foreground">
              Secure AI assistant with advanced capabilities and privacy protection.
              Experience the future of AI interaction.
            </p>
            {!showLoginForm ? (
              <Button size="lg" onClick={() => setShowLoginForm(true)}>
                Get Started
              </Button>
            ) : (
              <div className="w-full max-w-md">
                <AuthForms onClose={() => setShowLoginForm(false)} />
              </div>
            )}
          </section>
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
