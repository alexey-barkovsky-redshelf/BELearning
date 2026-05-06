import { parseStoredUserSessionJson, type StoredUserSession } from '@belearning/shared';
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { SESSION_STORAGE_KEY } from '../constants/sessionStorage';

export type UserSession = StoredUserSession;

function readStoredUserSession(): UserSession | null {
  if (typeof localStorage === 'undefined') {
    return null;
  }
  const json = localStorage.getItem(SESSION_STORAGE_KEY);
  if (json === null || json.length === 0) {
    return null;
  }
  return parseStoredUserSessionJson(json);
}

type UserContextValue = {
  session: UserSession | null;
  setSession: (s: UserSession | null) => void;
  userId: string;
  email: string;
  role: string;
  isLoggedIn: boolean;
  isAdmin: boolean;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<UserSession | null>(() => readStoredUserSession());

  const setSession = (s: UserSession | null) => {
    setSessionState(s);
    if (typeof localStorage !== 'undefined') {
      if (s === null) {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      } else {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(s));
      }
    }
  };

  const value = useMemo((): UserContextValue => {
    const userId = session?.userId ?? '';
    const email = session?.email ?? '';
    const role = session?.role ?? '';
    return {
      session,
      setSession,
      userId,
      email,
      role,
      isLoggedIn: session !== null,
      isAdmin: role === 'admin',
    };
  }, [session]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUser must be used within UserProvider');
  }
  return ctx;
}
