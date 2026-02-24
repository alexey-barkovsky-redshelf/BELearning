import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useUser } from '../context/UserContext';
import { useTranslation } from '../context/LocaleContext';

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

export function OrderList() {
  const { t } = useTranslation();
  const { userId, setUserId } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);

  const loadOrders = () => {
    if (!userId.trim()) {
      setOrders([]);
      return;
    }
    setLoading(true);
    setError(null);
    api
      .getOrdersByUser(userId)
      .then(setOrders)
      .catch((e) => {
        setError(e instanceof Error ? e.message : t('errors.loadFailed'));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleMarkPaid = (orderId: string) => {
    setPayingId(orderId);
    api
      .markOrderPaid(orderId)
      .then(() => {
        loadOrders();
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : t('errors.markPaidFailed'));
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
        <button type="button" className="button" onClick={loadOrders} disabled={!userId.trim()}>
          {t('orders.loadOrders')}
        </button>
      </div>
      <p className="hint">
        <Link to="/orders/new">{t('orders.createNew')}</Link>
      </p>

      {error ? <p className="error">{error}</p> : null}
      {loading ? <p className="loading">{t('common.loading')}</p> : null}
      {!loading && !error && orders.length === 0 && userId ? <p>{t('orders.empty')}</p> : null}
      {!loading && orders.length > 0 ? (
        <ul className="order-list">
          {orders.map((o) => {
            return (
              <li key={o.id} className="order-card">
                <div className="order-header">
                  <span>{t('orders.orderId', { id: o.id.slice(0, 8) })}</span>
                  <span className={`status status-${o.status}`}>{(() => { const k = `status.${o.status}`; const label = t(k); return label === k ? o.status : label; })()}</span>
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
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
