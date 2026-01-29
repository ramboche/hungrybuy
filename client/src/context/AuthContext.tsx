'use client';

import { createContext, useContext, useState } from 'react'; // Added useEffect back for router if needed, but removed for init
import { useRouter } from 'next/navigation';

interface User {
  name: string;
  phone: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // FIX: Lazy Initialize State
  // Pass a function to useState. This runs ONLY once on mount.
  const [user, setUser] = useState<User | null>(() => {
    // Check for window to avoid SSR errors (Next.js specific)
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (token && storedUser) {
        return JSON.parse(storedUser);
      }
    }
    return null;
  });

  // Since we initialize instantly, loading is technically always false 
  // unless you are verifying the token with an API call.
  const [isLoading] = useState(false);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    router.refresh();
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/'); 
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};