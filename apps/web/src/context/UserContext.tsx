import { createContext, useContext, useState, type ReactNode } from 'react';

const UserContext = createContext<{ userId: string; setUserId: (v: string) => void; isLoggedIn: boolean } | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState('');
  const isLoggedIn = userId.trim().length > 0;
  return (
    <UserContext.Provider value={{ userId, setUserId, isLoggedIn }}>
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
