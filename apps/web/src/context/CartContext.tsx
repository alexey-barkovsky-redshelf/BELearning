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
import type { OrderItem } from '../api/client';
import { useCurrency } from './CurrencyContext';

const STORAGE_PREFIX = 'belearning-cart';
const LEGACY_STORAGE_KEY = 'belearning-cart';

function storageKey(userId: string): string {
  return `${STORAGE_PREFIX}-${userId.length > 0 ? userId : 'guest'}`;
}

function parseCart(raw: string): OrderItem[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      (x): x is OrderItem =>
        x != null &&
        typeof x === 'object' &&
        typeof (x as OrderItem).productId === 'string' &&
        typeof (x as OrderItem).productTitle === 'string' &&
        typeof (x as OrderItem).priceAtPurchase === 'number' &&
        typeof (x as OrderItem).quantity === 'number',
    );
  } catch {
    return [];
  }
}

function loadCart(userId: string): OrderItem[] {
  const key = storageKey(userId);
  let s = localStorage.getItem(key);
  if (!s && key.endsWith('-guest')) {
    s = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (s) {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
  }
  if (!s) {
    return [];
  }
  return parseCart(s);
}

function saveCart(userId: string, items: OrderItem[]): void {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(items));
  } catch {
    void 0;
  }
}

function mergeOrderItems(into: OrderItem[], from: OrderItem[]): OrderItem[] {
  const map = new Map<string, OrderItem>();
  for (const item of into) {
    map.set(item.productId, { ...item });
  }
  for (const item of from) {
    const existing = map.get(item.productId);
    if (existing) {
      map.set(item.productId, {
        ...existing,
        quantity: existing.quantity + item.quantity,
      });
    } else {
      map.set(item.productId, { ...item });
    }
  }
  return Array.from(map.values());
}

type CartContextValue = {
  items: OrderItem[];
  addItem: (item: Omit<OrderItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  totalCount: number;
  totalSum: () => { sum: number; currency: string };
};

const CartContext = createContext<CartContextValue | null>(null);

type CartProviderProps = {
  children: ReactNode;
  userId: string;
};

export function CartProvider({ children, userId }: CartProviderProps) {
  const { currency } = useCurrency();
  const [items, setItems] = useState<OrderItem[]>(() => loadCart(userId));
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (userId.length > 0) {
      const savedForUser = loadCart(userId);
      const guestItems = loadCart('');
      if (guestItems.length > 0) {
        const merged = mergeOrderItems(savedForUser, guestItems);
        saveCart('', []);
        setItems(merged);
      } else {
        setItems(savedForUser);
      }
    } else {
      setItems(loadCart(userId));
    }
    isInitialLoad.current = true;
  }, [userId]);

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    saveCart(userId, items);
  }, [userId, items]);

  const addItem = useCallback((item: Omit<OrderItem, 'quantity'> & { quantity?: number }) => {
    const qty = item.quantity ?? 1;
    setItems((prev) => {
      const existing = prev.find((x) => x.productId === item.productId);
      if (existing) {
        return prev.map((x) =>
          x.productId === item.productId ? { ...x, quantity: x.quantity + qty } : x,
        );
      }
      return [...prev, { ...item, quantity: qty }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((x) => x.productId !== productId));
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) {
      setItems((prev) => prev.filter((x) => x.productId !== productId));
      return;
    }
    setItems((prev) => prev.map((x) => (x.productId === productId ? { ...x, quantity } : x)));
  }, []);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const totalCount = useMemo(() => items.reduce((n, i) => n + i.quantity, 0), [items]);

  const totalSum = useCallback(() => {
    const sum = items.reduce((s, i) => s + i.priceAtPurchase * i.quantity, 0);
    return { sum, currency };
  }, [items, currency]);

  const value = useMemo(
    () => ({ items, addItem, removeItem, setQuantity, clear, totalCount, totalSum }),
    [items, addItem, removeItem, setQuantity, clear, totalCount, totalSum],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
}
