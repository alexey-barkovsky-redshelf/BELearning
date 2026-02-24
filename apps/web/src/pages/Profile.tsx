import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { useUser } from '../context/UserContext';
import { useTranslation, useLocale } from '../context/LocaleContext';
import { useCurrency, CURRENCY_OPTIONS } from '../context/CurrencyContext';
import { useAsync } from '../hooks/useAsync';

type Order = {
  id: string;
  userId: string;
  status: string;
  totalAmount: number;
  currency: string;
  items: Array<{ productId: string; productTitle: string; priceAtPurchase: number; quantity: number }>;
  createdAt: string;
  updatedAt: string;
};

export function Profile() {
  const { t } = useTranslation();
  const { lang, setLang } = useLocale();
  const { currency, setCurrency } = useCurrency();
  const [searchParams] = useSearchParams();
  const thanks = searchParams.get('thanks');
  const { userId, isLoggedIn } = useUser();
  const { data: orders = [], loading: loadingOrders, error: errorOrders } = useAsync<Order[]>(
    () => api.getOrdersByUser(userId),
    [userId, isLoggedIn],
    { enabled: isLoggedIn, onError: () => { return t('errors.loadFailed'); } }
  );

  if (!isLoggedIn) {
    return (
      <div className="page">
        <h1>{t('profile.title')}</h1>
        <p className="profile-not-logged-in">{t('profile.notLoggedIn')}</p>
        <section className="profile-section profile-preferences">
          <h2>{t('profile.preferences')}</h2>
          <div className="profile-pref-row">
            <label htmlFor="profile-lang-guest">{t('profile.language')}</label>
            <select
              id="profile-lang-guest"
              value={lang}
              onChange={(e) => {
                const v = e.target.value;
                if (v === 'en' || v === 'ru') {
                  setLang(v);
                }
              }}
            >
              <option value="en">English</option>
              <option value="ru">Русский</option>
            </select>
          </div>
          <div className="profile-pref-row">
            <label htmlFor="profile-currency-guest">{t('profile.currency')}</label>
            <select
              id="profile-currency-guest"
              value={currency}
              onChange={(e) => {
                const v = e.target.value;
                if (CURRENCY_OPTIONS.some((o) => o.value === v)) {
                  setCurrency(v as (typeof CURRENCY_OPTIONS)[number]['value']);
                }
              }}
            >
              {CURRENCY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>{t('profile.title')}</h1>
      {thanks ? <p className="profile-thanks">{t('profile.thanks')}</p> : null}

      <section className="profile-section profile-preferences">
        <h2>{t('profile.preferences')}</h2>
        <div className="profile-pref-row">
          <label htmlFor="profile-lang">{t('profile.language')}</label>
          <select
            id="profile-lang"
            value={lang}
            onChange={(e) => {
              const v = e.target.value;
              if (v === 'en' || v === 'ru') {
                setLang(v);
              }
            }}
          >
            <option value="en">English</option>
            <option value="ru">Русский</option>
          </select>
        </div>
        <div className="profile-pref-row">
          <label htmlFor="profile-currency">{t('profile.currency')}</label>
          <select
            id="profile-currency"
            value={currency}
            onChange={(e) => {
              const v = e.target.value;
              if (CURRENCY_OPTIONS.some((o) => o.value === v)) {
                setCurrency(v as (typeof CURRENCY_OPTIONS)[number]['value']);
              }
            }}
          >
            {CURRENCY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="profile-section">
        <h2>{t('profile.myOrders')}</h2>
        {errorOrders ? <p className="error">{errorOrders}</p> : null}
        {loadingOrders ? <p className="loading">{t('common.loading')}</p> : null}
        {!loadingOrders && !errorOrders && orders.length === 0 ? <p className="profile-empty">{t('orders.empty')}</p> : null}
        {!loadingOrders && !errorOrders && orders.length > 0 ? (
          <ul className="order-list">
            {orders.map((o) => (
              <li key={o.id} className="order-card">
                <div className="order-header">
                  <span>{t('orders.orderId', { id: o.id.slice(0, 8) })}</span>
                  <span className={`status status-${o.status}`}>
                    {(() => { const k = `status.${o.status}`; const label = t(k); return label === k ? o.status : label; })()}
                  </span>
                </div>
                <p>
                  {o.totalAmount} {o.currency} · {t('orders.itemsCount', { count: o.items.length })}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
