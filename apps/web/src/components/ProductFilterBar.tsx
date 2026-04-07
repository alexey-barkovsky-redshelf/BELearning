import type { FormEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ListProductsQuery, ProductCategoryCode } from '@belearning/shared';
import { PRODUCT_CATEGORY_CODES } from '@belearning/utils';
import { useTranslation } from '../context/LocaleContext';
import { Dropdown } from './Dropdown';
import { CategoryIcon, PriceIcon, SearchIcon, SortIcon } from './icons/FilterIcons';
import {
  CategoryFilterPanel,
  PriceFilterPanel,
  SearchFilterPanel,
  SortFilterPanel,
} from './productFilter/FilterDropdownPanels';

type FilterPanel = 'search' | 'categories' | 'sort' | 'price';

export type ProductFilterBarProps = {
  syncKey: string;
  selectedCategories: ProductCategoryCode[];
  searchFromUrl: string;
  minPrice: string;
  maxPrice: string;
  sortBy: ListProductsQuery['sortBy'];
  order: ListProductsQuery['order'];
  onSearchCommit: (search: string) => void;
  onCategoriesChange: (codes: ProductCategoryCode[]) => void;
  onSortChange: (sortBy: ListProductsQuery['sortBy'], order: ListProductsQuery['order']) => void;
  onApplyPrice: (minPrice: string, maxPrice: string) => void;
  onResetAll: () => void;
};

export function ProductFilterBar({
  syncKey,
  selectedCategories,
  searchFromUrl,
  minPrice,
  maxPrice,
  sortBy,
  order,
  onSearchCommit,
  onCategoriesChange,
  onSortChange,
  onApplyPrice,
  onResetAll,
}: ProductFilterBarProps) {
  const { t } = useTranslation();
  const [searchDraft, setSearchDraft] = useState(searchFromUrl);
  const [minDraft, setMinDraft] = useState(minPrice);
  const [maxDraft, setMaxDraft] = useState(maxPrice);
  const [openPanel, setOpenPanel] = useState<FilterPanel | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedSet = useMemo(() => new Set(selectedCategories), [selectedCategories]);
  const selectAllRef = useRef<HTMLInputElement>(null);
  const allCategoriesSelected =
    selectedCategories.length > 0 && selectedCategories.length === PRODUCT_CATEGORY_CODES.length;

  const searchActive = searchFromUrl.trim().length > 0;
  const categoriesActive = selectedCategories.length > 0;
  const sortActive = sortBy !== 'name' || order !== 'asc';
  const priceActive = minPrice.trim().length > 0 || maxPrice.trim().length > 0;

  useEffect(() => {
    const el = selectAllRef.current;
    if (!el) {
      return;
    }
    el.indeterminate =
      selectedCategories.length > 0 && selectedCategories.length < PRODUCT_CATEGORY_CODES.length;
  }, [selectedCategories]);

  useEffect(() => {
    setSearchDraft(searchFromUrl);
    setMinDraft(minPrice);
    setMaxDraft(maxPrice);
  }, [syncKey, searchFromUrl, minPrice, maxPrice]);

  useEffect(() => {
    if (openPanel === 'search') {
      searchInputRef.current?.focus();
    }
  }, [openPanel]);

  const commitSearch = () => {
    onSearchCommit(searchDraft);
  };

  const toggleCategory = (code: ProductCategoryCode) => {
    if (selectedSet.has(code)) {
      onCategoriesChange(selectedCategories.filter((c) => c !== code));
    } else {
      onCategoriesChange([...selectedCategories, code]);
    }
  };

  const toggleSelectAllCategories = () => {
    if (allCategoriesSelected) {
      onCategoriesChange([]);
    } else {
      onCategoriesChange([...PRODUCT_CATEGORY_CODES]);
    }
  };

  const submitPrice = (e: FormEvent) => {
    e.preventDefault();
    onApplyPrice(minDraft, maxDraft);
  };

  const handleResetAll = () => {
    setOpenPanel(null);
    onResetAll();
  };

  const setPanelOpen = (panel: FilterPanel, open: boolean) => {
    setOpenPanel(open ? panel : null);
  };

  const panelClass = 'dropdown-panel product-filter-dropdown-panel';

  return (
    <div className="product-filter-compact">
      <div className="product-filter-toolbar-row">
        <button
          type="button"
          className="button button-secondary small product-filter-reset-all"
          onClick={handleResetAll}
        >
          {t('filterBar.resetAll')}
        </button>
        <div className="product-filter-toolbar-icons" role="group" aria-label={t('filterBar.toolbar')}>
          <Dropdown
            open={openPanel === 'search'}
            onOpenChange={(open) => {
              setPanelOpen('search', open);
            }}
            trigger={(tp) => (
              <button
                ref={tp.ref}
                type={tp.type}
                className={`product-filter-icon-btn${searchActive ? ' product-filter-icon-btn--active' : ''}`}
                aria-expanded={tp['aria-expanded']}
                aria-controls={tp['aria-controls']}
                aria-haspopup={tp['aria-haspopup']}
                id={tp.id}
                aria-label={t('filterBar.ariaOpenSearch')}
                title={t('filterBar.ariaOpenSearch')}
                onClick={tp.onClick}
              >
                <SearchIcon />
              </button>
            )}
            panelClassName={panelClass}
          >
            <SearchFilterPanel
              searchDraft={searchDraft}
              onSearchDraftChange={setSearchDraft}
              searchInputRef={searchInputRef}
              onCommit={commitSearch}
            />
          </Dropdown>

          <Dropdown
            open={openPanel === 'categories'}
            onOpenChange={(open) => {
              setPanelOpen('categories', open);
            }}
            trigger={(tp) => (
              <button
                ref={tp.ref}
                type={tp.type}
                className={`product-filter-icon-btn${categoriesActive ? ' product-filter-icon-btn--active' : ''}`}
                aria-expanded={tp['aria-expanded']}
                aria-controls={tp['aria-controls']}
                aria-haspopup={tp['aria-haspopup']}
                id={tp.id}
                aria-label={t('filterBar.ariaOpenCategories')}
                title={t('filterBar.ariaOpenCategories')}
                onClick={tp.onClick}
              >
                <CategoryIcon />
              </button>
            )}
            panelClassName={panelClass}
          >
            <CategoryFilterPanel
              selectAllRef={selectAllRef}
              allCategoriesSelected={allCategoriesSelected}
              selectedSet={selectedSet}
              onToggleSelectAll={toggleSelectAllCategories}
              onToggleCategory={toggleCategory}
            />
          </Dropdown>

          <Dropdown
            open={openPanel === 'sort'}
            onOpenChange={(open) => {
              setPanelOpen('sort', open);
            }}
            trigger={(tp) => (
              <button
                ref={tp.ref}
                type={tp.type}
                className={`product-filter-icon-btn${sortActive ? ' product-filter-icon-btn--active' : ''}`}
                aria-expanded={tp['aria-expanded']}
                aria-controls={tp['aria-controls']}
                aria-haspopup={tp['aria-haspopup']}
                id={tp.id}
                aria-label={t('filterBar.ariaOpenSort')}
                title={t('filterBar.ariaOpenSort')}
                onClick={tp.onClick}
              >
                <SortIcon />
              </button>
            )}
            panelClassName={`${panelClass} product-filter-dropdown-panel--sort`}
          >
            <SortFilterPanel sortBy={sortBy} order={order} onSortChange={onSortChange} />
          </Dropdown>

          <Dropdown
            open={openPanel === 'price'}
            onOpenChange={(open) => {
              setPanelOpen('price', open);
            }}
            trigger={(tp) => (
              <button
                ref={tp.ref}
                type={tp.type}
                className={`product-filter-icon-btn${priceActive ? ' product-filter-icon-btn--active' : ''}`}
                aria-expanded={tp['aria-expanded']}
                aria-controls={tp['aria-controls']}
                aria-haspopup={tp['aria-haspopup']}
                id={tp.id}
                aria-label={t('filterBar.ariaOpenPrice')}
                title={t('filterBar.ariaOpenPrice')}
                onClick={tp.onClick}
              >
                <PriceIcon />
              </button>
            )}
            panelClassName={panelClass}
          >
            <PriceFilterPanel
              minDraft={minDraft}
              maxDraft={maxDraft}
              onMinDraftChange={setMinDraft}
              onMaxDraftChange={setMaxDraft}
              onSubmit={submitPrice}
            />
          </Dropdown>
        </div>
      </div>
    </div>
  );
}
