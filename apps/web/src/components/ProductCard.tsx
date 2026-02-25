import { Link } from 'react-router-dom';
import type { Product, ProductCategoryCode } from '../api/client';
import { useTranslation } from '../context/LocaleContext';

type ProductCardProps = {
  product: Product;
  inCart: boolean;
  isFavorite: boolean;
  onToggleFavorite: (productId: string) => void;
  onAddToCart: (item: { productId: string; productTitle: string; priceAtPurchase: number; quantity?: number }) => void;
  /** Optional: show description (e.g. on Favorites page) */
  showDescription?: boolean;
  /** Optional: show extra "Remove" button (e.g. on Favorites page) */
  showRemoveFromFavorites?: boolean;
  className?: string;
};

export function ProductCard({
  product,
  inCart,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  showDescription = false,
  showRemoveFromFavorites = false,
  className = '',
}: ProductCardProps) {
  const { t } = useTranslation();

  return (
    <li className={`product-card ${className}`.trim()}>
      <button
        type="button"
        className={`product-card-fav ${isFavorite ? 'active' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          onToggleFavorite(product.id);
        }}
        aria-label={isFavorite ? t('products.removeFromFavorites') : t('products.addToFavorites')}
      >
        <svg
          className="product-card-fav-icon"
          viewBox="0 0 24 24"
          fill={isFavorite ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>
      <Link to={`/products/${product.id}`} className="product-card-link">
        <strong>{product.name}</strong>
        {product.manufacturer ? (
          <span className="product-card-manufacturer">{product.manufacturer}</span>
        ) : null}
        {product.categories?.length ? (
          <span className="product-card-categories">
            {product.categories.slice(0, 3).map((c: ProductCategoryCode) => (
              <span key={c} className="category-badge">
                {t(`categories.${c}`)}
              </span>
            ))}
          </span>
        ) : null}
        {showDescription && product.description ? (
          <span className="product-card-desc">{product.description}</span>
        ) : null}
        <span className="price">
          {product.price} {product.currency}
        </span>
      </Link>
      <div className="product-card-actions">
        <button
          type="button"
          className={`button small product-card-buy ${inCart ? 'filled' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            if (!inCart) {
              onAddToCart({
                productId: product.id,
                productTitle: product.name,
                priceAtPurchase: product.price,
              });
            }
          }}
          disabled={inCart}
        >
          {inCart ? t('cart.inCart') : t('products.buy')}
        </button>
        {showRemoveFromFavorites ? (
          <button
            type="button"
            className="button small button-secondary"
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite(product.id);
            }}
          >
            {t('favorites.remove')}
          </button>
        ) : null}
      </div>
    </li>
  );
}
