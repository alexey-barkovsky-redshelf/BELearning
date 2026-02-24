import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useUser } from '../context/UserContext';
import { useTranslation } from '../context/LocaleContext';

type Product = { id: string; name: string; slug: string; price: number; currency: string };

type CartItem = { productId: string; productTitle: string; priceAtPurchase: number; quantity: number };

export function OrderCreate() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userId, setUserId } = useUser();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getProducts().then(setProducts).catch(() => {});
  }, []);

  const addToCart = (p: Product, qty: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((x) => x.productId === p.id);
      if (existing) {
        return prev.map((x) => {
          return x.productId === p.id ? { ...x, quantity: x.quantity + qty } : x;
        });
      }
      return [...prev, { productId: p.id, productTitle: p.name, priceAtPurchase: p.price, quantity: qty }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      return prev.filter((x) => x.productId !== productId);
    });
  };

  const total = cart.reduce((sum, i) => {
    return sum + i.priceAtPurchase * i.quantity;
  }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim()) {
      setError(t('errors.enterUserId'));
      return;
    }
    if (cart.length === 0) {
      setError(t('errors.addOneProduct'));
      return;
    }
    setSubmitting(true);
    setError(null);
    api
      .createOrder({ userId, items: cart })
      .then(() => {
        navigate('/orders');
        setCart([]);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : t('errors.createOrderFailed'));
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <div className="page">
      <Link to="/orders" className="back">
        {t('orders.backToOrders')}
      </Link>
      <h1>{t('orderCreate.title')}</h1>

      <form onSubmit={handleSubmit} className="order-form">
        <label>
          {t('orderCreate.userId')}
          <input
            type="text"
            value={userId}
            onChange={(e) => {
              setUserId(e.target.value);
            }}
            placeholder={t('common.userIdPlaceholder')}
            required
          />
        </label>

        <h2>{t('orderCreate.productsHeading')}</h2>
        <ul className="product-list compact">
          {products.map((p) => {
            return (
              <li key={p.id} className="product-row">
                <span>{p.name}</span>
                <span className="price">
                  {p.price} {p.currency}
                </span>
                <button
                  type="button"
                  className="button small"
                  onClick={() => {
                    addToCart(p);
                  }}
                >
                  {t('orderCreate.add')}
                </button>
              </li>
            );
          })}
        </ul>

        {cart.length > 0 ? (
          <>
            <h2>{t('orderCreate.cartHeading')}</h2>
            <ul className="cart-list">
              {cart.map((i) => {
                return (
                  <li key={i.productId} className="cart-row">
                    <span>{i.productTitle}</span>
                    <span>× {i.quantity}</span>
                    <span>
                      {i.priceAtPurchase * i.quantity} {products[0]?.currency ?? ''}
                    </span>
                    <button
                      type="button"
                      className="button small"
                      onClick={() => {
                        removeFromCart(i.productId);
                      }}
                    >
                      {t('orderCreate.remove')}
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="total">
              {t('orderCreate.total')} {total.toFixed(2)} {products[0]?.currency ?? 'USD'}
            </p>
            <button type="submit" className="button" disabled={submitting}>
              {submitting ? t('orderCreate.submitting') : t('orderCreate.submit')}
            </button>
          </>
        ) : null}
      </form>

      {error ? <p className="error">{error}</p> : null}
    </div>
  );
}
