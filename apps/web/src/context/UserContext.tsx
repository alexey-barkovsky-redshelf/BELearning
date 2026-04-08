import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { setAuthTokenGetter } from '../api/authHeader';

const STORAGE_KEY = 'belearning-session';

export type UserSession = {
  token: string;
  userId: string;
  loginId: string;
  role: string;
};

function parseSession(raw: string): UserSession | null {
  try {
    const p = JSON.parse(raw) as Record<string, unknown>;
    const token = typeof p.token === 'string' ? p.token : '';
    const userId = typeof p.userId === 'string' ? p.userId : '';
    const loginId = typeof p.loginId === 'string' ? p.loginId : '';
    const role = typeof p.role === 'string' ? p.role : '';
    if (token.length === 0 || userId.length === 0 || loginId.length === 0) {
      return null;
    }
    return { token, userId, loginId, role: role.length > 0 ? role : 'user' };
  } catch {
    return null;
  }
}

function loadSession(): UserSession | null {
  if (typeof localStorage === 'undefined') {
    return null;
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null || raw.length === 0) {
    return null;
  }
  return parseSession(raw);
}

type UserContextValue = {
  session: UserSession | null;
  setSession: (s: UserSession | null) => void;
  userId: string;
  loginId: string;
  role: string;
  isLoggedIn: boolean;
  isAdmin: boolean;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<UserSession | null>(() => loadSession());

  const setSession = (s: UserSession | null) => {
    setSessionState(s);
    if (typeof localStorage !== 'undefined') {
      if (s === null) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      }
    }
  };

  useEffect(() => {
    setAuthTokenGetter(() => session?.token ?? null);
  }, [session]);

  const value = useMemo((): UserContextValue => {
    const userId = session?.userId ?? '';
    const loginId = session?.loginId ?? '';
    const role = session?.role ?? '';
    return {
      session,
      setSession,
      userId,
      loginId,
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
