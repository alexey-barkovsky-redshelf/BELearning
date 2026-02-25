import { Outlet, Link, NavLink } from 'react-router-dom';
import { APP_NAME } from '@belearning/shared';
import { useTranslation } from '../context/LocaleContext';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useUser } from '../context/UserContext';

export function Layout() {
  const { t, i18n } = useTranslation();
  const { totalCount } = useCart();
  const { favoriteIds } = useFavorites();
  const { userId } = useUser();
  return (
    <div className="layout">
      <header className="header">
        <Link to="/" className="logo">
          {APP_NAME}
        </Link>
        <nav className="nav">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            {t('nav.home')}
          </NavLink>
          <NavLink
            to="/favorites"
            className={({ isActive }) => `nav-link nav-favorites ${isActive ? 'active' : ''}`}
          >
            {t('nav.favorites')}
            {favoriteIds.length > 0 ? <span className="favorites-badge">{favoriteIds.length}</span> : null}
          </NavLink>
          <NavLink
            to="/cart"
            className={({ isActive }) => `nav-link nav-cart ${isActive ? 'active' : ''}`}
          >
            {t('nav.cart')}
            {totalCount > 0 ? <span className="cart-badge">{totalCount}</span> : null}
          </NavLink>
          <Link to="/profile" className="nav-link nav-user-circle" title={t('nav.profile')}>
            <span className="nav-user-avatar">{userId ? userId.slice(0, 1).toUpperCase() : '?'}</span>
          </Link>
          <span className="lang-switcher">
            <button type="button" className={i18n.language === 'ru' ? 'active' : ''} onClick={() => i18n.changeLanguage('ru')}>RU</button>
            <span className="lang-sep">|</span>
            <button type="button" className={i18n.language === 'en' ? 'active' : ''} onClick={() => i18n.changeLanguage('en')}>EN</button>
          </span>
        </nav>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
