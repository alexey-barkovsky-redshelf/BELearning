import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { APP_NAME } from '@belearning/utils';
import { MAIN_ELEMENT_ID } from '../constants/layoutIds';
import { useTranslation } from '../context/LocaleContext';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useUser } from '../context/UserContext';

export function Layout() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { totalCount } = useCart();
  const { favoriteIds } = useFavorites();
  const { loginId, isLoggedIn, isAdmin, setSession } = useUser();
  const avatarLetter = loginId.length > 0 ? loginId.slice(0, 1).toUpperCase() : '?';
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
          {isAdmin ? (
            <NavLink
              to="/admin"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {t('nav.admin')}
            </NavLink>
          ) : null}
          <Link to="/profile" className="nav-link nav-user-circle" title={t('nav.profile')}>
            <span className="nav-user-avatar">{avatarLetter}</span>
          </Link>
          {isLoggedIn ? (
            <button
              type="button"
              className="nav-link nav-logout"
              onClick={() => {
                setSession(null);
                navigate('/');
              }}
            >
              {t('nav.logout')}
            </button>
          ) : (
            <NavLink to="/login" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              {t('nav.login')}
            </NavLink>
          )}
          <span className="lang-switcher">
            <button type="button" className={i18n.language === 'ru' ? 'active' : ''} onClick={() => i18n.changeLanguage('ru')}>RU</button>
            <span className="lang-sep">|</span>
            <button type="button" className={i18n.language === 'en' ? 'active' : ''} onClick={() => i18n.changeLanguage('en')}>EN</button>
          </span>
        </nav>
      </header>
      <main id={MAIN_ELEMENT_ID} className="main">
        <Outlet />
      </main>
    </div>
  );
}
