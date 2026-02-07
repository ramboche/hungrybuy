'use client';

import { createContext, useContext, useEffect, useState } from 'react'; // Added useEffect back for router if needed, but removed for init
import { useRouter } from 'next/navigation';
// import { api } from '@/lib/api';

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

  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (token && storedUser) {
        return JSON.parse(storedUser);
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(false); // Assume token is valid for now, or handle actual verification if needed

      

      // try {
      //   const response = await api.get('/menu');
      //   setUser(response.data.user);
      // } catch (error) {
      //   console.error("Token verification failed:", error);
      //   // 5. If API fails (401), Logout
      //   localStorage.removeItem('token');
      //   localStorage.removeItem('user');
      //   setUser(null);
      // } finally {
      //   // 6. ALWAYS finish loading, whether success or fail
      //   setIsLoading(false);
      // }
    };

    verifyToken();
  }, []);

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