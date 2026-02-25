import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Order } from '../api/client';
import { useUser } from '../context/UserContext';
import { useTranslation } from '../context/LocaleContext';
import { useAsync } from '../hooks/useAsync';
import { getStatusLabel } from '../utils/status';

export function OrderList() {
  const { t } = useTranslation();
  const { userId, setUserId } = useUser();
  const [payingId, setPayingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: orders = [], loading, error, refetch } = useAsync<Order[]>(
    () => api.getOrdersByUser(userId),
    [userId],
    { enabled: !!userId.trim(), onError: (e) => (e instanceof Error ? e.message : t('errors.loadFailed')) }
  );

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

  return (
    <div className="page">
      <h1>{t('orders.title')}</h1>
      <div className="user-row">
        <label>
          {t('orders.userIdLabel')}
          <input
            type="text"
            value={userId}
            onChange={(e) => {
              setUserId(e.target.value);
            }}
            placeholder={t('common.userIdPlaceholder')}
          />
        </label>
        <button type="button" className="button" onClick={refetch} disabled={!userId.trim()}>
          {t('orders.loadOrders')}
        </button>
      </div>
      <p className="hint">
        <Link to="/orders/new">{t('orders.createNew')}</Link>
      </p>

      {error ? <p className="error">{error}</p> : null}
      {actionError ? <p className="error">{actionError}</p> : null}
      {loading ? <p className="loading">{t('common.loading')}</p> : null}
      {!loading && !error && orders.length === 0 && userId ? <p>{t('orders.empty')}</p> : null}
      {!loading && orders.length > 0 ? (
        <ul className="order-list">
          {orders.map((o) => (
              <li key={o.id} className="order-card">
                <div className="order-header">
                  <span>{t('orders.orderId', { id: o.id.slice(0, 8) })}</span>
                  <span className={`status status-${o.status}`}>
                    {getStatusLabel(o.status, t)}
                  </span>
                </div>
                <p>
                  {o.totalAmount} {o.currency} · {t('orders.itemsCount', { count: o.items.length })}
                </p>
                {o.status === 'draft' ? (
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
