import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useTranslation } from '../context/LocaleContext';
import { PageShell } from '../components/PageShell';
import { EmptyState } from '../components/EmptyState';
import { formatMoney } from '../utils/format';

export function Cart() {
  const { t } = useTranslation();
  const { items, removeItem, setQuantity, totalSum, clear } = useCart();

  if (items.length === 0) {
    return (
      <PageShell title={t('cart.title')}>
        <EmptyState
          message={t('cart.empty')}
          actionLabel={t('cart.toCatalog')}
          actionTo="/"
          className="cart-empty"
        />
      </PageShell>
    );
  }

  const { sum, currency } = totalSum();

  return (
    <PageShell title={t('cart.title')}>
      <ul className="cart-list cart-page-list">
        {items.map((i) => (
          <li key={i.productId} className="cart-row">
            <span className="cart-row-title">{i.productTitle}</span>
            <span className="cart-row-qty">
              <button type="button" className="cart-qty-btn" onClick={() => setQuantity(i.productId, i.quantity - 1)} aria-label="-">−</button>
              {i.quantity}
              <button type="button" className="cart-qty-btn" onClick={() => setQuantity(i.productId, i.quantity + 1)} aria-label="+">+</button>
            </span>
            <span className="cart-row-price">
              {formatMoney(i.priceAtPurchase * i.quantity, currency)}
            </span>
            <button type="button" className="button small" onClick={() => removeItem(i.productId)}>
              {t('orderCreate.remove')}
            </button>
          </li>
        ))}
      </ul>
      <p className="total">
        {t('orderCreate.total')} {formatMoney(sum, currency)}
      </p>
      <div className="cart-actions">
        <button type="button" className="button button-secondary" onClick={() => clear()}>
          {t('cart.clearCart')}
        </button>
        <Link to="/checkout" className="button">
          {t('cart.checkout')}
        </Link>
      </div>
    </PageShell>
  );
}
