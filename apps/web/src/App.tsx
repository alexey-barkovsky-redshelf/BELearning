import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProviders } from './components/AppProviders';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { ProductList } from './pages/ProductList';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Profile } from './pages/Profile';
import { Favorites } from './pages/Favorites';
import { Login } from './pages/Login';
import { OrderList } from './pages/OrderList';
import { OrderCreate } from './pages/OrderCreate';

export function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<ProductList />} />
            <Route path="products/:id" element={<ProductDetail />} />
            <Route path="cart" element={<Cart />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="orders" element={<OrderList />} />
            <Route path="orders/new" element={<OrderCreate />} />
            <Route path="login" element={<Login />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </AppProviders>
    </BrowserRouter>
  );
}
