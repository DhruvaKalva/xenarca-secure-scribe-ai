
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "@/components/ui/sonner";

export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signupWithEmail: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithMicrosoft: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('xenarcai_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes only - in a real app you would validate with an API
      const mockUser = {
        id: 'user-' + Math.random().toString(36).substr(2, 9),
        name: email.split('@')[0],
        email
      };
      
      setUser(mockUser);
      localStorage.setItem('xenarcai_user', JSON.stringify(mockUser));
      toast.success("Successfully logged in");
    } catch (error) {
      console.error('Login failed:', error);
      toast.error("Login failed. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signupWithEmail = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes only
      const mockUser = {
        id: 'user-' + Math.random().toString(36).substr(2, 9),
        name,
        email
      };
      
      setUser(mockUser);
      localStorage.setItem('xenarcai_user', JSON.stringify(mockUser));
      toast.success("Account created successfully");
    } catch (error) {
      console.error('Signup failed:', error);
      toast.error("Signup failed. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.error("Google authentication not implemented in this demo");
      // In a real implementation, we would redirect to Google OAuth
    } catch (error) {
      console.error('Google login failed:', error);
      toast.error("Google login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithMicrosoft = async () => {
    try {
      setIsLoading(true);
      
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.error("Microsoft authentication not implemented in this demo");
      // In a real implementation, we would redirect to Microsoft OAuth
    } catch (error) {
      console.error('Microsoft login failed:', error);
      toast.error("Microsoft login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('xenarcai_user');
    toast.success("Successfully logged out");
  };

  const contextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signupWithEmail,
    loginWithGoogle,
    loginWithMicrosoft,
    logout,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
