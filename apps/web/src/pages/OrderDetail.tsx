import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, type Order } from '../api/client';
import { useTranslation } from '../context/LocaleContext';
import { useUser } from '../context/UserContext';
import { useAsync } from '../hooks/useAsync';
import { StatusHelper } from '../utils/statusHelper';
import { FormatHelper } from '../utils/formatHelper';

function formatDateTime(iso: string, lang: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso;
  }
  return new Intl.DateTimeFormat(lang === 'ru' ? 'ru-RU' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d);
}

export function OrderDetail() {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { isLoggedIn, isAdmin } = useUser();
  const [payingId, setPayingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: order, loading, error, refetch } = useAsync<Order>(
    () => api.getOrder(id!),
    [id, isLoggedIn],
    {
      enabled: isLoggedIn && !!id,
      onError: (e) => (e instanceof Error ? e.message : t('orderDetail.notFound')),
    },
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

  if (!isLoggedIn) {
    return (
      <div className="page">
        <h1>{t('orderDetail.title')}</h1>
        <p>{t('orders.loginToView')}</p>
        <Link to={`/login?return=/orders/${id ?? ''}`} className="button">
          {t('checkout.login')}
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page">
        <p className="loading">{t('common.loading')}</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="page">
        <Link to="/orders" className="back">
          {t('orders.backToOrders')}
        </Link>
        <p className="error">{error ?? t('orderDetail.notFound')}</p>
      </div>
    );
  }

  return (
    <div className="page">
      <Link to="/orders" className="back">
        {t('orders.backToOrders')}
      </Link>

      <div className="order-detail-header">
        <h1>{t('orderDetail.title')}</h1>
        <span className={`status status-${order.status}`}>
          {StatusHelper.getStatusLabel(order.status, t)}
        </span>
      </div>

      {actionError ? <p className="error">{actionError}</p> : null}

      <dl className="order-detail-meta">
        <dt>{t('orderDetail.orderIdLabel')}</dt>
        <dd className="mono">{order.id}</dd>

        <dt>{t('orderDetail.customerIdLabel')}</dt>
        <dd className="mono">{order.userId}</dd>

        <dt>{t('orderDetail.statusLabel')}</dt>
        <dd>
          <span className={`status status-${order.status}`}>
            {StatusHelper.getStatusLabel(order.status, t)}
          </span>
        </dd>

        <dt>{t('orderDetail.currencyLabel')}</dt>
        <dd>{order.currency}</dd>

        <dt>{t('orderDetail.createdAtLabel')}</dt>
        <dd>{formatDateTime(order.createdAt, i18n.language)}</dd>

        <dt>{t('orderDetail.updatedAtLabel')}</dt>
        <dd>{formatDateTime(order.updatedAt, i18n.language)}</dd>

        <dt>{t('orderDetail.totalLabel')}</dt>
        <dd>
          <strong>{FormatHelper.formatMoney(order.totalAmount, order.currency)}</strong>
        </dd>
      </dl>

      <h2>{t('orderDetail.itemsHeading')}</h2>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t('orderDetail.colItem')}</th>
              <th>{t('orderDetail.colUnitPrice')}</th>
              <th>{t('orderDetail.colQty')}</th>
              <th>{t('orderDetail.colLineTotal')}</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.productId}>
                <td>
                  <Link to={`/products/${item.productId}`}>{item.productTitle}</Link>
                </td>
                <td>{FormatHelper.formatMoney(item.priceAtPurchase, order.currency)}</td>
                <td>{item.quantity}</td>
                <td>
                  {FormatHelper.formatMoney(item.priceAtPurchase * item.quantity, order.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isAdmin && order.status === 'draft' ? (
        <div style={{ marginTop: 'var(--space-6)' }}>
          <button
            type="button"
            className="button"
            onClick={() => {
              handleMarkPaid(order.id);
            }}
            disabled={payingId === order.id}
          >
            {payingId === order.id ? t('orders.markPaidProgress') : t('orders.markPaid')}
          </button>
        </div>
      ) : null}
    </div>
  );
}
