import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

const UserContext = createContext<{ userId: string; setUserId: (v: string) => void; isLoggedIn: boolean } | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserIdState] = useState('');

  const setUserId = useCallback((v: string) => {
    setUserIdState(v);
  }, []);

  return (
    <UserContext.Provider value={{ userId, setUserId, isLoggedIn: userId.trim().length > 0 }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUser must be used within UserProvider');
  }
  return ctx;
}
