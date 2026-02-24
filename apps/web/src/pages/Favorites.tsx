import { Link } from 'react-router-dom';
import { api, type Product } from '../api/client';
import { useTranslation } from '../context/LocaleContext';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useAsync } from '../hooks/useAsync';

export function Favorites() {
  const { t } = useTranslation();
  const { addItem, items: cartItems } = useCart();
  const { favoriteIds, toggleFavorite, clearFavorites } = useFavorites();

  const { data: products = [], loading } = useAsync<Product[]>(
    () => {
      if (favoriteIds.length === 0) {
        return Promise.resolve([]);
      }
      return Promise.all(favoriteIds.map((id) => api.getProduct(id)));
    },
    [favoriteIds.join(',')],
    { enabled: favoriteIds.length > 0 }
  );

  if (favoriteIds.length === 0 && !loading) {
    return (
      <div className="page">
        <h1>{t('favorites.title')}</h1>
        <p className="favorites-empty">{t('favorites.empty')}</p>
        <Link to="/" className="button">
          {t('nav.home')}
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>{t('favorites.title')}</h1>
      <div className="favorites-actions">
        <button type="button" className="button button-secondary" onClick={clearFavorites}>
          {t('favorites.clearAll')}
        </button>
        <Link to="/" className="button button-secondary">
          {t('nav.home')}
        </Link>
      </div>
      {loading ? (
        <p className="loading">{t('common.loading')}</p>
      ) : (
        <ul className="product-list favorites-grid">
          {products.map((p) => (
            <li key={p.id} className="product-card">
              <button
                type="button"
                className="product-card-fav active"
                onClick={(e) => {
                  e.preventDefault();
                  toggleFavorite(p.id);
                }}
                aria-label={t('products.removeFromFavorites')}
              >
                <svg className="product-card-fav-icon" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
              <Link to={`/products/${p.id}`} className="product-card-link">
                <strong>{p.name}</strong>
                {p.manufacturer ? (
                  <span className="product-card-manufacturer">{p.manufacturer}</span>
                ) : null}
                {p.categories && p.categories.length > 0 ? (
                  <span className="product-card-categories">
                    {p.categories.slice(0, 3).map((c) => (
                      <span key={c} className="category-badge">
                        {t(`categories.${c}`)}
                      </span>
                    ))}
                  </span>
                ) : null}
                {p.description ? (
                  <span className="product-card-desc">{p.description}</span>
                ) : null}
                <span className="price">
                  {p.price} {p.currency}
                </span>
              </Link>
              <div className="product-card-actions">
                <button
                  type="button"
                  className={`button small product-card-buy ${cartItems.some((i) => i.productId === p.id) ? 'filled' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    if (!cartItems.some((i) => i.productId === p.id)) {
                      addItem({
                        productId: p.id,
                        productTitle: p.name,
                        priceAtPurchase: p.price,
                      });
                    }
                  }}
                  disabled={cartItems.some((i) => i.productId === p.id)}
                >
                  {cartItems.some((i) => i.productId === p.id) ? t('cart.inCart') : t('products.buy')}
                </button>
                <button
                  type="button"
                  className="button small button-secondary"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFavorite(p.id);
                  }}
                >
                  {t('favorites.remove')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
