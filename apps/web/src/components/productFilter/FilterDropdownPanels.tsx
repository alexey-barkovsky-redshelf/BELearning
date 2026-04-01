import type { FormEvent, RefObject } from 'react';
import type { ListProductsQuery, ProductCategoryCode } from '@belearning/shared';
import { PRODUCT_CATEGORY_CODES } from '@belearning/utils';
import { useTranslation } from '../../context/LocaleContext';
import { SearchIcon } from '../icons/FilterIcons';

export type SearchFilterPanelProps = {
  searchDraft: string;
  onSearchDraftChange: (value: string) => void;
  searchInputRef: RefObject<HTMLInputElement | null>;
  onCommit: () => void;
};

export function SearchFilterPanel({
  searchDraft,
  onSearchDraftChange,
  searchInputRef,
  onCommit,
}: SearchFilterPanelProps) {
  const { t } = useTranslation();
  return (
    <div>
      <div className="product-filter-search-wrap">
        <input
          ref={searchInputRef}
          type="search"
          className="product-filter-search-input"
          placeholder={t('dashboard.searchPlaceholder')}
          aria-label={t('filterBar.search')}
          value={searchDraft}
          onChange={(e) => {
            onSearchDraftChange(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onCommit();
            }
          }}
          autoComplete="off"
        />
        <button
          type="button"
          className="product-filter-search-submit"
          aria-label={t('filterBar.searchSubmit')}
          onClick={onCommit}
        >
          <SearchIcon />
        </button>
      </div>
    </div>
  );
}

export type CategoryFilterPanelProps = {
  selectAllRef: RefObject<HTMLInputElement | null>;
  allCategoriesSelected: boolean;
  selectedSet: Set<ProductCategoryCode>;
  onToggleSelectAll: () => void;
  onToggleCategory: (code: ProductCategoryCode) => void;
};

export function CategoryFilterPanel({
  selectAllRef,
  allCategoriesSelected,
  selectedSet,
  onToggleSelectAll,
  onToggleCategory,
}: CategoryFilterPanelProps) {
  const { t } = useTranslation();
  return (
    <div>
      <div className="product-filter-categories" role="group" aria-label={t('filterBar.category')}>
        <label className="product-filter-cat-item product-filter-select-all">
          <input ref={selectAllRef} type="checkbox" checked={allCategoriesSelected} onChange={onToggleSelectAll} />
          <span>{t('filterBar.selectAll')}</span>
        </label>
        {PRODUCT_CATEGORY_CODES.map((code) => (
          <label key={code} className="product-filter-cat-item">
            <input
              type="checkbox"
              checked={selectedSet.has(code)}
              onChange={() => {
                onToggleCategory(code);
              }}
            />
            <span>{t(`categories.${code}`)}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export type SortFilterPanelProps = {
  sortBy: ListProductsQuery['sortBy'];
  order: ListProductsQuery['order'];
  onSortChange: (sortBy: ListProductsQuery['sortBy'], order: ListProductsQuery['order']) => void;
};

export function SortFilterPanel({ sortBy, order, onSortChange }: SortFilterPanelProps) {
  const { t } = useTranslation();
  return (
    <div>
      <div className="product-filter-sort-row">
        <label className="product-filter-inline-label" htmlFor="filter-sort-by">
          {t('filterBar.sortBy')}
        </label>
        <select
          id="filter-sort-by"
          className="product-filter-bar-select"
          value={sortBy}
          onChange={(e) => {
            onSortChange(e.target.value as ListProductsQuery['sortBy'], order);
          }}
        >
          <option value="name">{t('filterBar.sortName')}</option>
          <option value="price">{t('filterBar.sortPrice')}</option>
          <option value="createdAt">{t('filterBar.sortCreatedAt')}</option>
        </select>
        <label className="product-filter-inline-label" htmlFor="filter-order">
          {t('filterBar.order')}
        </label>
        <select
          id="filter-order"
          className="product-filter-bar-select"
          value={order}
          onChange={(e) => {
            onSortChange(sortBy, e.target.value as ListProductsQuery['order']);
          }}
        >
          <option value="asc">{t('filterBar.orderAsc')}</option>
          <option value="desc">{t('filterBar.orderDesc')}</option>
        </select>
      </div>
    </div>
  );
}

export type PriceFilterPanelProps = {
  minDraft: string;
  maxDraft: string;
  onMinDraftChange: (value: string) => void;
  onMaxDraftChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
};

export function PriceFilterPanel({
  minDraft,
  maxDraft,
  onMinDraftChange,
  onMaxDraftChange,
  onSubmit,
}: PriceFilterPanelProps) {
  const { t } = useTranslation();
  return (
    <form aria-label={t('filterBar.priceRange')} onSubmit={onSubmit}>
      <div className="product-filter-price-row">
        <input
          type="number"
          min={0}
          step="any"
          inputMode="decimal"
          className="product-filter-bar-input product-filter-bar-num"
          placeholder={t('filterBar.minPriceShort')}
          aria-label={t('filterBar.minPrice')}
          value={minDraft}
          onChange={(e) => {
            onMinDraftChange(e.target.value);
          }}
        />
        <span className="product-filter-price-sep">—</span>
        <input
          type="number"
          min={0}
          step="any"
          inputMode="decimal"
          className="product-filter-bar-input product-filter-bar-num"
          placeholder={t('filterBar.maxPriceShort')}
          aria-label={t('filterBar.maxPrice')}
          value={maxDraft}
          onChange={(e) => {
            onMaxDraftChange(e.target.value);
          }}
        />
        <button type="submit" className="button small product-filter-apply-price">
          {t('filterBar.applyPrice')}
        </button>
      </div>
    </form>
  );
}
