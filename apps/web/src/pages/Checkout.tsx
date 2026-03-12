import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { useTranslation } from '../context/LocaleContext';
import { PageShell } from '../components/PageShell';
import { EmptyState } from '../components/EmptyState';
import { FormatHelper } from '../utils/formatHelper';

export function Checkout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userId, isLoggedIn } = useUser();
  const { items, clear, totalSum } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { sum, currency } = totalSum();

  if (items.length === 0 && !submitting) {
    return (
      <PageShell title={t('checkout.title')}>
        <EmptyState message={t('cart.empty')} actionLabel={t('cart.toCatalog')} actionTo="/" />
      </PageShell>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      return;
    }
    setSubmitting(true);
    setError(null);
    api
      .createOrder({ userId, items, currency })
      .then(() => {
        clear();
        navigate('/profile?thanks=1');
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : t('errors.createOrderFailed'));
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <PageShell title={t('checkout.title')} backTo={{ to: '/cart', label: `← ${t('cart.title')}` }}>
      <ul className="checkout-items">
        {items.map((i) => (
          <li key={i.productId} className="checkout-item">
            <span className="checkout-item-title">{i.productTitle}</span>
            <span className="checkout-item-qty">× {i.quantity}</span>
            <span className="checkout-item-price">
              {FormatHelper.formatMoney(i.priceAtPurchase * i.quantity, currency)}
            </span>
          </li>
        ))}
      </ul>

      <p className="total">
        {t('orderCreate.total')} {FormatHelper.formatMoney(sum, currency)} · {t('orders.itemsCount', { count: items.length })}
      </p>

      {!isLoggedIn ? (
        <div className="checkout-guest-block">
          <p className="checkout-login-required">{t('checkout.loginRequired')}</p>
          <Link to="/login?return=/checkout" className="button">
            {t('checkout.login')}
          </Link>
          <button type="button" className="button" disabled>
            {t('checkout.submit')}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="order-form checkout-form">
          <button type="submit" className="button" disabled={submitting}>
            {submitting ? t('orderCreate.submitting') : t('checkout.submit')}
          </button>
        </form>
      )}

      {error ? <p className="error">{error}</p> : null}
    </PageShell>
  );
}
