import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ListProductsQuery, ProductCategoryCode } from '@belearning/shared';
import { parseListProductsQueryFromUrlSearchParams } from '@belearning/shared';
import {
  api,
  type ListProductsPageSize,
  type PaginatedProducts,
  DEFAULT_LIST_PRODUCTS_PAGE_SIZE,
} from '../api/client';
import { useTranslation } from '../context/LocaleContext';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useAsync } from '../hooks/useAsync';
import { useProductListScroll } from '../hooks/useProductListScroll';
import { ProductCard } from '../components/ProductCard';
import { PageShell } from '../components/PageShell';
import { Pagination } from '../components/Pagination';
import { ProductFilterBar } from '../components/ProductFilterBar';

export function ProductList() {
  const { t } = useTranslation();
  const { addItem, items: cartItems } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [searchParams, setSearchParams] = useSearchParams();
  const qs = searchParams.toString();
  const listParams = useMemo(() => parseListProductsQueryFromUrlSearchParams(new URLSearchParams(qs)), [qs]);

  const selectedCategories = listParams.category ?? [];
  const searchFromUrl = searchParams.get('search') ?? '';
  const minPriceStr = searchParams.get('minPrice') ?? '';
  const maxPriceStr = searchParams.get('maxPrice') ?? '';
  const sortBy = listParams.sortBy;
  const order = listParams.order;
  const page = listParams.page;
  const pageSize = listParams.pageSize;

  useProductListScroll(page, pageSize);

  const { data, loading, error } = useAsync<PaginatedProducts>(
    () => api.getProducts(listParams),
    [qs],
    {
      onError: (e) => {
        return e instanceof Error ? e.message : t('errors.loadFailed');
      },
    }
  );

  const products = data?.items ?? [];
  const totalPages = data?.totalPages ?? 0;
  const total = data?.total ?? 0;

  const handleSearchCommit = useCallback(
    (search: string) => {
      const trimmed = search.trim();
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (trimmed) {
          next.set('search', trimmed);
        } else {
          next.delete('search');
        }
        next.delete('page');
        return next;
      });
    },
    [setSearchParams],
  );

  const handleCategoriesChange = useCallback(
    (codes: ProductCategoryCode[]) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (codes.length > 0) {
          next.set('category', codes.join(','));
        } else {
          next.delete('category');
        }
        next.delete('page');
        return next;
      });
    },
    [setSearchParams],
  );

  const handleSortChange = useCallback(
    (nextSortBy: ListProductsQuery['sortBy'], nextOrder: ListProductsQuery['order']) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (nextSortBy === 'name') {
          next.delete('sortBy');
        } else {
          next.set('sortBy', nextSortBy);
        }
        if (nextOrder === 'asc') {
          next.delete('order');
        } else {
          next.set('order', nextOrder);
        }
        next.delete('page');
        return next;
      });
    },
    [setSearchParams],
  );

  const handleApplyPrice = useCallback(
    (minStr: string, maxStr: string) => {
      const minT = minStr.trim();
      const maxT = maxStr.trim();
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (minT) {
          next.set('minPrice', minT);
        } else {
          next.delete('minPrice');
        }
        if (maxT) {
          next.set('maxPrice', maxT);
        } else {
          next.delete('maxPrice');
        }
        next.delete('page');
        return next;
      });
    },
    [setSearchParams],
  );

  const handleResetAll = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  const goToPage = useCallback(
    (nextPage: number) => {
      setSearchParams((prev) => {
        const p = new URLSearchParams(prev);
        if (nextPage <= 1) {
          p.delete('page');
        } else {
          p.set('page', String(nextPage));
        }
        return p;
      });
    },
    [setSearchParams],
  );

  const handlePageSizeChange = useCallback(
    (next: ListProductsPageSize) => {
      setSearchParams((prev) => {
        const p = new URLSearchParams(prev);
        if (next === DEFAULT_LIST_PRODUCTS_PAGE_SIZE) {
          p.delete('pageSize');
        } else {
          p.set('pageSize', String(next));
        }
        p.delete('page');
        return p;
      });
    },
    [setSearchParams],
  );

  if (loading && products.length === 0) {
    return <p className="loading">{t('products.loading')}</p>;
  }
  if (error) {
    return <p className="error">{error}</p>;
  }

  return (
    <PageShell title={t('products.title')} backTo={{ to: '/', label: t('products.backToCatalog') }}>
      <ProductFilterBar
        syncKey={qs}
        selectedCategories={selectedCategories}
        searchFromUrl={searchFromUrl}
        minPrice={minPriceStr}
        maxPrice={maxPriceStr}
        sortBy={sortBy}
        order={order}
        onSearchCommit={handleSearchCommit}
        onCategoriesChange={handleCategoriesChange}
        onSortChange={handleSortChange}
        onApplyPrice={handleApplyPrice}
        onResetAll={handleResetAll}
      />

      {products.length === 0 ? (
        <p className="hint">{t('products.empty')}</p>
      ) : (
        <ul className="product-list">
          {products.map((p) => (
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
      )}

      <Pagination
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        total={total}
        onPageChange={goToPage}
        onPageSizeChange={handlePageSizeChange}
      />
    </PageShell>
  );
}
