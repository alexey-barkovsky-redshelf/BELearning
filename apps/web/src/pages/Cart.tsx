import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useTranslation } from '../context/LocaleContext';

export function Cart() {
  const { t } = useTranslation();
  const { currency } = useCurrency();
  const { items, removeItem, setQuantity, totalSum, clear } = useCart();

  if (items.length === 0) {
    return (
      <div className="page">
        <h1>{t('cart.title')}</h1>
        <p className="cart-empty">{t('cart.empty')}</p>
        <Link to="/" className="button">
          {t('cart.toCatalog')}
        </Link>
      </div>
    );
  }

  const { sum } = totalSum();

  return (
    <div className="page">
      <h1>{t('cart.title')}</h1>
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
              {(Math.round(i.priceAtPurchase * i.quantity * 100) / 100).toFixed(2)} {currency}
            </span>
            <button type="button" className="button small" onClick={() => removeItem(i.productId)}>
              {t('orderCreate.remove')}
            </button>
          </li>
        ))}
      </ul>
      <p className="total">
        {t('orderCreate.total')} {(Math.round(sum * 100) / 100).toFixed(2)} {currency}
      </p>
      <div className="cart-actions">
        <button type="button" className="button button-secondary" onClick={() => clear()}>
          {t('cart.clearCart')}
        </button>
        <Link to="/checkout" className="button">
          {t('cart.checkout')}
        </Link>
      </div>
    </div>
  );
}
