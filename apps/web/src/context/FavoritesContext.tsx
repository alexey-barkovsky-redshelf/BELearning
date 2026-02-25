import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

const STORAGE_PREFIX = 'belearning-favorites';

function storageKey(userId: string): string {
  return `${STORAGE_PREFIX}-${userId || 'guest'}`;
}

function loadFavorites(userId: string): string[] {
  try {
    const s = localStorage.getItem(storageKey(userId));
    if (!s) {
      return [];
    }
    const parsed = JSON.parse(s) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((x): x is string => typeof x === 'string');
  } catch {
    return [];
  }
}

function saveFavorites(userId: string, ids: string[]): void {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(ids));
  } catch {}
}

type FavoritesContextValue = {
  favoriteIds: string[];
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => void;
  clearFavorites: () => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

type FavoritesProviderProps = {
  children: ReactNode;
  userId: string;
};

export function FavoritesProvider({ children, userId }: FavoritesProviderProps) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => loadFavorites(userId));
  const isInitialLoad = useRef(true);

  useEffect(() => {
    setFavoriteIds(loadFavorites(userId));
    isInitialLoad.current = true;
  }, [userId]);

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    saveFavorites(userId, favoriteIds);
  }, [userId, favoriteIds]);

  const isFavorite = useCallback(
    (productId: string) => favoriteIds.includes(productId),
    [favoriteIds]
  );

  const toggleFavorite = useCallback((productId: string) => {
    setFavoriteIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      return [...prev, productId];
    });
  }, []);

  const clearFavorites = useCallback(() => {
    setFavoriteIds([]);
  }, []);

  const value = useMemo(
    () => ({ favoriteIds, isFavorite, toggleFavorite, clearFavorites }),
    [favoriteIds, isFavorite, toggleFavorite, clearFavorites]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return ctx;
}
