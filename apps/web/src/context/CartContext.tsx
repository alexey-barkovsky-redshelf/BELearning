import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type CartItem = {
  productId: string;
  productTitle: string;
  priceAtPurchase: number;
  quantity: number;
};

const STORAGE_KEY = 'belearning-cart';

function loadCart(): CartItem[] {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (!s) return [];
    const parsed = JSON.parse(s) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is CartItem =>
        x != null &&
        typeof x === 'object' &&
        typeof (x as CartItem).productId === 'string' &&
        typeof (x as CartItem).productTitle === 'string' &&
        typeof (x as CartItem).priceAtPurchase === 'number' &&
        typeof (x as CartItem).quantity === 'number'
    );
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  totalCount: number;
  totalSum: () => { sum: number; currency: string };
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    saveCart(items);
  }, [items]);

  const addItem = useCallback((item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const qty = item.quantity ?? 1;
    setItems((prev) => {
      const existing = prev.find((x) => x.productId === item.productId);
      if (existing) {
        return prev.map((x) =>
          x.productId === item.productId ? { ...x, quantity: x.quantity + qty } : x
        );
      }
      return [...prev, { ...item, quantity: qty } as CartItem];
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
    setItems((prev) =>
      prev.map((x) => (x.productId === productId ? { ...x, quantity } : x))
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const totalCount = useMemo(() => items.reduce((n, i) => n + i.quantity, 0), [items]);

  const totalSum = useCallback(() => {
    const sum = items.reduce((s, i) => s + i.priceAtPurchase * i.quantity, 0);
    return { sum, currency: 'USD' as const };
  }, [items]);

  const value = useMemo(
    () => ({ items, addItem, removeItem, setQuantity, clear, totalCount, totalSum }),
    [items, addItem, removeItem, setQuantity, clear, totalCount, totalSum]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
