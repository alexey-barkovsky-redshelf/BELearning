import { Link } from 'react-router-dom';
import { api, type Product } from '../api/client';
import { useTranslation } from '../context/LocaleContext';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useAsync } from '../hooks/useAsync';
import { ProductCard } from '../components/ProductCard';
import { PageShell } from '../components/PageShell';
import { EmptyState } from '../components/EmptyState';

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
      <PageShell title={t('favorites.title')}>
        <EmptyState
          message={t('favorites.empty')}
          actionLabel={t('nav.home')}
          actionTo="/"
          className="favorites-empty"
        />
      </PageShell>
    );
  }

  return (
    <PageShell title={t('favorites.title')}>
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
            <ProductCard
              key={p.id}
              product={p}
              inCart={cartItems.some((i) => i.productId === p.id)}
              isFavorite
              onToggleFavorite={toggleFavorite}
              onAddToCart={addItem}
              showDescription
              showRemoveFromFavorites
            />
          ))}
        </ul>
      )}
    </PageShell>
  );
}
