import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@/types';

// 1. UPDATED INTERFACE (Now includes Email/Password methods)
interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (credential: string) => Promise<{ isNewUser: boolean; user?: User; email?: string }>;
  loginWithEmail: (email: string, password: string) => Promise<{ isNewUser: boolean; user?: User; email?: string }>;
  registerWithEmail: (email: string, password: string) => Promise<{ isNewUser: boolean; email?: string }>;
  logout: () => void;
  updateNickname: (nickname: string, phoneNumber: string) => Promise<void>;
  updateBalance: (newBalance: number) => void;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);
const API_BASE_URL = 'https://unistake-backend.onrender.com/api';

const formatUser = (dbUser: any): User => ({
  id: dbUser.id?.toString() || Date.now().toString(),
  email: dbUser.email,
  nickname: dbUser.nickname || '',
  phoneNumber: dbUser.phone_number || '',
  balance: parseFloat(dbUser.balance_kes) || 0,
  isAdmin: Boolean(dbUser.is_admin),
  name: dbUser.name || dbUser.email.split('@')[0]
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from LocalStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('unistake_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('unistake_user');
      }
    }
    setIsLoading(false);
  }, []);

  // --- GOOGLE SIGN IN ---
  const login = useCallback(async (credential: string): Promise<{ isNewUser: boolean; user?: User; email?: string }> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Authentication failed');
      
      if (data.user) {
        const formattedUser = formatUser(data.user);
        setUser(formattedUser);
        localStorage.setItem('unistake_user', JSON.stringify(formattedUser)); 
        return { isNewUser: false, user: formattedUser };
      }
      
      if (data.isNewUser) {
        const pendingUser: User = {
          id: 'pending', email: data.email, nickname: '', phoneNumber: '', balance: 0, isAdmin: false, name: data.email.split('@')[0]
        };
        setUser(pendingUser); 
        return { isNewUser: true, email: data.email };
      }
      return { isNewUser: true };
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- NEW: EMAIL SIGN UP ---
  const registerWithEmail = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed');

      if (data.isNewUser) {
        const pendingUser: User = {
          id: 'pending', email: data.email, nickname: '', phoneNumber: '', balance: 0, isAdmin: false, name: data.email.split('@')[0]
        };
        setUser(pendingUser);
        return { isNewUser: true, email: data.email };
      }
      return { isNewUser: false };
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- NEW: EMAIL LOG IN ---
  const loginWithEmail = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');

      if (data.user) {
        const formattedUser = formatUser(data.user);
        setUser(formattedUser);
        localStorage.setItem('unistake_user', JSON.stringify(formattedUser));
        return { isNewUser: data.isNewUser, user: formattedUser };
      } else if (data.isNewUser) {
         // Edge case: They registered, but didn't finish the onboarding form
         const pendingUser: User = {
           id: 'pending', email: data.email, nickname: '', phoneNumber: '', balance: 0, isAdmin: false, name: data.email.split('@')[0]
         };
         setUser(pendingUser);
         return { isNewUser: true, email: data.email };
      }
      throw new Error("Invalid response from server");
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateNickname = useCallback(async (nickname: string, phoneNumber: string): Promise<void> => {
    if (!user) throw new Error('No user session');
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/nickname`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, nickname, phone_number: phoneNumber }),
      });
      
      const updatedDbUser = await response.json();
      const formattedUser = formatUser(updatedDbUser);
      setUser(formattedUser);
      localStorage.setItem('unistake_user', JSON.stringify(formattedUser));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const updateBalance = useCallback((newBalance: number) => {
    setUser(prev => {
      if (!prev) return null;
      const safeBalance = isNaN(newBalance) ? prev.balance : newBalance;
      const updated = { ...prev, balance: safeBalance };
      localStorage.setItem('unistake_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const stored = localStorage.getItem('unistake_user');
      if (!stored) return;
      
      const localUser = JSON.parse(stored);
      if (!localUser.email) return;

      const response = await fetch(`${API_BASE_URL}/balance/${encodeURIComponent(localUser.email)}`);
      const data = await response.json();
      
      if (data && data.balance_kes !== undefined) {
        const freshBalance = parseFloat(data.balance_kes);
        const safeBalance = isNaN(freshBalance) ? 0 : freshBalance;

        setUser(prev => {
          if (!prev) return null;
          const updatedUser = { ...prev, balance: safeBalance };
          localStorage.setItem('unistake_user', JSON.stringify(updatedUser));
          return updatedUser;
        });
      }
    } catch (error) {
      console.error("Balance refresh failed:", error);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('unistake_user');
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated: !!user && user.id !== 'pending', // Ensures pending users stay on onboarding!
        isLoading,
        isAdmin: user?.isAdmin || false,
        login,
        loginWithEmail,     // <-- Added
        registerWithEmail,  // <-- Added
        logout,
        updateNickname,
        updateBalance,
        refreshUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}