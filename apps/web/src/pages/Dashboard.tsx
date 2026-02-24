import { Link } from 'react-router-dom';
import { api, type Category } from '../api/client';
import { useTranslation } from '../context/LocaleContext';
import { useAsync } from '../hooks/useAsync';
import { getCategoryImageUrl } from '../config/categoryImages';

export function Dashboard() {
  const { t } = useTranslation();
  const { data: categories = [], loading, error } = useAsync<Category[]>(
    () => api.getCategories(),
    [],
    {
      onError: (e) => {
        return e instanceof Error ? e.message : 'Failed to load';
      },
    }
  );

  if (error) {
    return (
      <div className="page">
        <h1 className="dashboard-title">{t('dashboard.title')}</h1>
        <p className="error">{error}</p>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="dashboard-header">
        <h1 className="dashboard-title">{t('dashboard.title')}</h1>
        <div className="dashboard-search">
          <input
            type="search"
            className="dashboard-search-input"
            placeholder={t('dashboard.searchPlaceholder')}
            aria-label={t('dashboard.searchPlaceholder')}
          />
        </div>
      </header>
      {loading ? (
        <p className="loading">{t('common.loading')}</p>
      ) : (
        <div className="dashboard-grid">
          <Link
            to="/products"
            className="dashboard-tile"
            data-category="all"
            style={{ backgroundImage: `url(${getCategoryImageUrl('all')})` }}
          >
            <span className="dashboard-tile-title">{t('categories.all')}</span>
            <span className="dashboard-tile-desc">{t('dashboard.tiles.allDesc')}</span>
          </Link>
          {(categories ?? []).map((cat) => (
            <Link
              key={cat.code}
              to={`/products?category=${encodeURIComponent(cat.code)}`}
              className="dashboard-tile"
              data-category={cat.code}
              style={{ backgroundImage: `url(${getCategoryImageUrl(cat.code)})` }}
            >
              <span className="dashboard-tile-title">{t(`categories.${cat.code}`)}</span>
              <span className="dashboard-tile-desc">{t(`dashboard.tiles.${cat.code}Desc`)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
