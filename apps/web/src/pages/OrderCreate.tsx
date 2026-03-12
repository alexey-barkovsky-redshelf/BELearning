import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, type Product, type OrderItem } from '../api/client';
import { useUser } from '../context/UserContext';
import { useTranslation } from '../context/LocaleContext';
import { useCurrency } from '../context/CurrencyContext';
import { PageShell } from '../components/PageShell';
import { FormatHelper } from '../utils/formatHelper';

export function OrderCreate() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userId, setUserId } = useUser();
  const { currency } = useCurrency();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getProducts().then(setProducts).catch(() => {});
  }, []);

  const addToCart = (p: Product, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((x) => x.productId === p.id);
      if (existing) {
        return prev.map((x) => (x.productId === p.id ? { ...x, quantity: x.quantity + qty } : x));
      }
      return [...prev, { productId: p.id, productTitle: p.name, priceAtPurchase: p.price, quantity: qty }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((x) => x.productId !== productId));
  };

  const total = cart.reduce((sum, i) => sum + i.priceAtPurchase * i.quantity, 0);

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
      .createOrder({ userId, items: cart, currency })
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
    <PageShell title={t('orderCreate.title')} backTo={{ to: '/orders', label: t('orders.backToOrders') }}>
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
                      {FormatHelper.formatMoney(i.priceAtPurchase * i.quantity, currency)}
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
              {t('orderCreate.total')} {FormatHelper.formatMoney(total, currency)}
            </p>
            <button type="submit" className="button" disabled={submitting}>
              {submitting ? t('orderCreate.submitting') : t('orderCreate.submit')}
            </button>
          </>
        ) : null}
      </form>

      {error ? <p className="error">{error}</p> : null}
    </PageShell>
  );
}
