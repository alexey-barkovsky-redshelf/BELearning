import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Order } from '../api/client';
import { useUser } from '../context/UserContext';
import { useTranslation } from '../context/LocaleContext';
import { useAsync } from '../hooks/useAsync';
import { StatusHelper } from '../utils/statusHelper';

export function OrderList() {
  const { t } = useTranslation();
  const { isLoggedIn, isAdmin } = useUser();
  const [payingId, setPayingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: ordersData, loading, error, refetch } = useAsync<Order[]>(
    () => api.getMyOrders(),
    [isLoggedIn],
    { enabled: isLoggedIn, onError: (e) => (e instanceof Error ? e.message : t('errors.loadFailed')) }
  );
  const orders = ordersData ?? [];

  const handleMarkPaid = (orderId: string) => {
    setActionError(null);
    setPayingId(orderId);
    api
      .markOrderPaid(orderId)
      .then(() => refetch())
      .catch((e) => {
        setActionError(e instanceof Error ? e.message : t('errors.markPaidFailed'));
      })
      .finally(() => {
        setPayingId(null);
      });
  };

  if (!isLoggedIn) {
    return (
      <div className="page">
        <h1>{t('orders.title')}</h1>
        <p>{t('orders.loginToView')}</p>
        <Link to="/login?return=/orders" className="button">
          {t('checkout.login')}
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>{t('orders.title')}</h1>
      <p className="hint">
        <Link to="/orders/new">{t('orders.createNew')}</Link>
      </p>

      {error ? <p className="error">{error}</p> : null}
      {actionError ? <p className="error">{actionError}</p> : null}
      {loading ? <p className="loading">{t('common.loading')}</p> : null}
      {!loading && !error && orders.length === 0 ? <p>{t('orders.empty')}</p> : null}
      {!loading && orders.length > 0 ? (
        <ul className="order-list">
          {orders.map((o) => (
            <li key={o.id} className="order-card">
              <div className="order-header">
                <span>{t('orders.orderId', { id: o.id.slice(0, 8) })}</span>
                <span className={`status status-${o.status}`}>
                  {StatusHelper.getStatusLabel(o.status, t)}
                </span>
              </div>
              <p>
                {o.totalAmount} {o.currency} · {t('orders.itemsCount', { count: o.items.length })}
              </p>
              {isAdmin && o.status === 'draft' ? (
                <button
                  type="button"
                  className="button small"
                  onClick={() => {
                    handleMarkPaid(o.id);
                  }}
                  disabled={payingId === o.id}
                >
                  {payingId === o.id ? t('orders.markPaidProgress') : t('orders.markPaid')}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
