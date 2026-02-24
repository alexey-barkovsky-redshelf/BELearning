import { useParams, Link } from 'react-router-dom';
import { api, type Product } from '../api/client';
import { useTranslation } from '../context/LocaleContext';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useAsync } from '../hooks/useAsync';

export function ProductDetail() {
  const { t } = useTranslation();
  const { addItem, items: cartItems, setQuantity } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { id } = useParams<{ id: string }>();
  const { data: product, loading, error } = useAsync<Product>(
    () => api.getProduct(id!),
    [id],
    {
      enabled: !!id,
      onError: (e) => {
        return e instanceof Error ? e.message : t('productDetail.notFoundShort');
      },
    }
  );

  const cartItem = product ? cartItems.find((i) => i.productId === product.id) : null;

  if (loading) {
    return <p className="loading">{t('common.loading')}</p>;
  }
  if (error || !product) {
    return (
      <div className="page">
        <p className="error">{error ?? t('productDetail.notFound')}</p>
        <Link to="/">{t('products.backToCatalogLink')}</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <Link to="/" className="back">
        {t('products.backToCatalog')}
      </Link>
      <div className="product-detail-header">
        <h1>{product.name}</h1>
        <button
          type="button"
          className={`product-detail-fav ${isFavorite(product.id) ? 'active' : ''}`}
          onClick={() => toggleFavorite(product.id)}
          aria-label={isFavorite(product.id) ? t('products.removeFromFavorites') : t('products.addToFavorites')}
        >
          <svg className="product-card-fav-icon" viewBox="0 0 24 24" fill={isFavorite(product.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
      {product.manufacturer ? (
        <p className="product-detail-manufacturer">
          {t('products.manufacturer')}: {product.manufacturer}
        </p>
      ) : null}
      {product.categories && product.categories.length > 0 ? (
        <p className="product-detail-categories">
          {product.categories.map((c) => (
            <span key={c} className="category-badge">
              {t(`categories.${c}`)}
            </span>
          ))}
        </p>
      ) : null}
      <p className="price">
        {product.price} {product.currency}
      </p>
      {product.description ? <p className="description">{product.description}</p> : null}
      <div className="product-actions">
        {cartItem ? (
          <>
            <span className="product-detail-in-cart">{t('cart.inCart')}</span>
            <span className="product-detail-qty">
              <button
                type="button"
                className="cart-qty-btn"
                onClick={() => setQuantity(product.id, cartItem.quantity - 1)}
                aria-label="-"
              >
                −
              </button>
              <span className="product-detail-qty-num">{cartItem.quantity}</span>
              <button
                type="button"
                className="cart-qty-btn"
                onClick={() => setQuantity(product.id, cartItem.quantity + 1)}
                aria-label="+"
              >
                +
              </button>
            </span>
            <Link to="/cart" className="button button-secondary">
              {t('cart.goToCart')}
            </Link>
          </>
        ) : (
          <button
            type="button"
            className="button"
            onClick={() => {
              addItem({
                productId: product.id,
                productTitle: product.name,
                priceAtPurchase: product.price,
                quantity: 1,
              });
            }}
          >
            {t('products.addToOrder')}
          </button>
        )}
      </div>
    </div>
  );
}
