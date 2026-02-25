import { Link, useSearchParams } from 'react-router-dom';
import { api, type Product, type ProductCategoryCode, PRODUCT_CATEGORY_CODES } from '../api/client';
import { useTranslation } from '../context/LocaleContext';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useAsync } from '../hooks/useAsync';
import { ProductCard } from '../components/ProductCard';
import { PageShell } from '../components/PageShell';

export function ProductList() {
  const { t } = useTranslation();
  const { addItem, items: cartItems } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') ?? '';
  const selectedCategory: ProductCategoryCode | undefined =
    categoryParam && PRODUCT_CATEGORY_CODES.includes(categoryParam as ProductCategoryCode)
      ? (categoryParam as ProductCategoryCode)
      : undefined;

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
    <PageShell title={t('products.title')} backTo={{ to: '/', label: t('products.backToCatalog') }}>
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
          <ProductCard
            key={p.id}
            product={p}
            inCart={cartItems.some((i) => i.productId === p.id)}
            isFavorite={isFavorite(p.id)}
            onToggleFavorite={toggleFavorite}
            onAddToCart={addItem}
          />
        ))}
      </ul>
    </PageShell>
  );
}
