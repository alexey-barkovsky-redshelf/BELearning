import { Link, useSearchParams } from 'react-router-dom';
import { api, type Product, type ProductCategoryCode, PRODUCT_CATEGORY_CODES } from '../api/client';
import { useTranslation } from '../context/LocaleContext';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useAsync } from '../hooks/useAsync';

export function ProductList() {
  const { t } = useTranslation();
  const { addItem, items: cartItems } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') ?? '';
  const selectedCategory: ProductCategoryCode | undefined =
    categoryParam && PRODUCT_CATEGORY_CODES.includes(categoryParam as ProductCategoryCode) ? (categoryParam as ProductCategoryCode) : undefined;

  const { data: products = [], loading, error } = useAsync<Product[]>(
    () => api.getProducts(selectedCategory),
    [selectedCategory],
    {
      onError: (e) => {
        return e instanceof Error ? e.message : t('errors.loadFailed');
      },
    }
  );

  const setCategory = (cat: string | undefined) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (!cat) next.delete('category');
      else next.set('category', cat);
      return next;
    });
  };

  if (loading && (products ?? []).length === 0) {
    return <p className="loading">{t('products.loading')}</p>;
  }
  if (error) {
    return <p className="error">{error}</p>;
  }

  return (
    <div className="page">
      <Link to="/" className="back">
        {t('products.backToCatalog')}
      </Link>
      <h1>{t('products.title')}</h1>

      <div className="category-filter">
        <button
          type="button"
          className={!selectedCategory ? 'category-btn active' : 'category-btn'}
          onClick={() => setCategory(undefined)}
        >
          {t('categories.all')}
        </button>
        {PRODUCT_CATEGORY_CODES.map((code) => (
          <button
            key={code}
            type="button"
            className={selectedCategory === code ? 'category-btn active' : 'category-btn'}
            onClick={() => setCategory(code)}
          >
            {t(`categories.${code}`)}
          </button>
        ))}
      </div>

      <ul className="product-list">
        {(products ?? []).map((p) => (
          <li key={p.id} className="product-card">
            <button
              type="button"
              className={`product-card-fav ${isFavorite(p.id) ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                toggleFavorite(p.id);
              }}
              aria-label={isFavorite(p.id) ? t('products.removeFromFavorites') : t('products.addToFavorites')}
            >
              <svg className="product-card-fav-icon" viewBox="0 0 24 24" fill={isFavorite(p.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
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
              <span className="price">
                {p.price} {p.currency}
              </span>
            </Link>
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
          </li>
        ))}
      </ul>
    </div>
  );
}
