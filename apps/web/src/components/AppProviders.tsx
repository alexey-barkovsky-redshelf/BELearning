import type { ReactNode } from 'react';
import { UserProvider, useUser } from '../context/UserContext';
import { CurrencyProvider } from '../context/CurrencyContext';
import { FavoritesProvider } from '../context/FavoritesContext';
import { CartProvider } from '../context/CartContext';

function InnerProviders({ children }: { children: ReactNode }) {
  const { userId } = useUser();
  return (
    <FavoritesProvider userId={userId}>
      <CurrencyProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </CurrencyProvider>
    </FavoritesProvider>
  );
}


export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <UserProvider>
      <InnerProviders>{children}</InnerProviders>
    </UserProvider>
  );
}
