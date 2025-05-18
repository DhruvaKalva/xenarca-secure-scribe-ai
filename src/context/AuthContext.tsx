
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

// Simple mock user storage for demo
const mockUserStorage = {
  getUsers: (): Record<string, {name: string, password: string}> => {
    try {
      const users = localStorage.getItem('xenarcai_users');
      return users ? JSON.parse(users) : {};
    } catch (error) {
      console.error('Failed to parse users data:', error);
      return {};
    }
  },
  
  saveUser: (email: string, name: string, password: string) => {
    try {
      const users = mockUserStorage.getUsers();
      users[email] = { name, password };
      localStorage.setItem('xenarcai_users', JSON.stringify(users));
    } catch (error) {
      console.error('Failed to save user data:', error);
    }
  },
  
  validateUser: (email: string, password: string): { valid: boolean, name?: string } => {
    const users = mockUserStorage.getUsers();
    if (users[email] && users[email].password === password) {
      return { valid: true, name: users[email].name };
    }
    return { valid: false };
  }
};

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
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check against our mock storage
      const validation = mockUserStorage.validateUser(email, password);
      
      if (!validation.valid) {
        toast.error("Invalid email or password");
        throw new Error("Invalid email or password");
      }
      
      const mockUser = {
        id: 'user-' + Math.random().toString(36).substr(2, 9),
        name: validation.name || email.split('@')[0],
        email
      };
      
      setUser(mockUser);
      localStorage.setItem('xenarcai_user', JSON.stringify(mockUser));
      toast.success("Successfully logged in");
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signupWithEmail = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check if user already exists
      const users = mockUserStorage.getUsers();
      if (users[email]) {
        toast.error("An account with this email already exists");
        throw new Error("Email already in use");
      }
      
      // Save the new user
      mockUserStorage.saveUser(email, name, password);
      
      // Create user session
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
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 800));
      
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
      await new Promise(resolve => setTimeout(resolve, 800));
      
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
