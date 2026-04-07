import { LIST_PRODUCTS_PAGE_SIZES, type ListProductsPageSize } from '@belearning/shared';
import { useTranslation } from '../context/LocaleContext';

export type PaginationProps = {
  page: number;
  pageSize: ListProductsPageSize;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: ListProductsPageSize) => void;
  className?: string;
};

export function Pagination({
  page,
  pageSize,
  totalPages,
  total,
  onPageChange,
  onPageSizeChange,
  className,
}: PaginationProps) {
  const { t } = useTranslation();
  if (total <= 0) {
    return null;
  }
  const pages = Math.max(1, totalPages);
  const rootClass = ['pagination', className].filter(Boolean).join(' ');
  return (
    <nav className={rootClass} aria-label={t('pagination.label')}>
      <button type="button" className="pagination-btn" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        {t('products.prevPage')}
      </button>
      <span className="pagination-info">
        {t('products.pageInfo', { page, totalPages: pages, total })}
      </span>
      <button
        type="button"
        className="pagination-btn"
        disabled={page >= pages}
        onClick={() => onPageChange(page + 1)}
      >
        {t('products.nextPage')}
      </button>
      <div className="pagination-per-page">
        <label className="pagination-per-page-label" htmlFor="pagination-page-size">
          {t('products.perPage')}
        </label>
        <select
          id="pagination-page-size"
          className="pagination-per-page-select"
          value={pageSize}
          onChange={(e) => {
            onPageSizeChange(Number(e.target.value) as ListProductsPageSize);
          }}
        >
          {LIST_PRODUCTS_PAGE_SIZES.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
    </nav>
  );
}
