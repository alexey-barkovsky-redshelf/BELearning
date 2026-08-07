import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, type Order } from '../api/client';
import { useTranslation } from '../context/LocaleContext';
import { useUser } from '../context/UserContext';
import { useAsync } from '../hooks/useAsync';
import { StatusHelper } from '../utils/statusHelper';
import { FormatHelper } from '../utils/formatHelper';

export function AdminOrders() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isLoggedIn, isAdmin } = useUser();
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login?return=/admin/orders');
      return;
    }
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, isLoggedIn, navigate]);

  const {
    data: orders,
    loading,
    error,
    refetch,
  } = useAsync<Order[]>(
    () => api.adminListOrders(),
    [isAdmin],
    { enabled: isLoggedIn && isAdmin, onError: () => t('errors.loadFailed') },
  );

  const handleMarkPaid = (orderId: string) => {
    setPayError(null);
    setPayingId(orderId);
    api
      .markOrderPaid(orderId)
      .then(() => {
        refetch();
      })
      .catch((e) => {
        setPayError(e instanceof Error ? e.message : t('errors.markPaidFailed'));
      })
      .finally(() => {
        setPayingId(null);
      });
  };

  if (!isLoggedIn || !isAdmin) {
    return null;
  }

  const orderRows = orders ?? [];

  return (
    <div className="page admin-page">
      <h1>{t('admin.ordersTitle')}</h1>

      <div className="admin-section-header" style={{ marginBottom: 'var(--space-6)' }}>
        <button type="button" className="button" onClick={() => refetch()}>
          {t('admin.refresh')}
        </button>
        <Link to="/admin" className="button secondary" style={{ marginLeft: 'var(--space-3)' }}>
          {t('nav.admin')}
        </Link>
      </div>

      {payError ? <p className="error">{payError}</p> : null}
      {error ? <p className="error">{error}</p> : null}
      {loading ? <p className="loading">{t('common.loading')}</p> : null}

      {!loading && !error ? (
        <section className="admin-section">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t('admin.colOrder')}</th>
                  <th>{t('admin.colOrderUser')}</th>
                  <th>{t('admin.colStatus')}</th>
                  <th>{t('admin.colTotal')}</th>
                  <th>{t('admin.colActions')}</th>
                </tr>
              </thead>
              <tbody>
                {orderRows.map((o) => (
                  <tr key={o.id}>
                    <td className="mono">
                      <Link to={`/orders/${o.id}`}>{o.id.slice(0, 8)}…</Link>
                    </td>
                    <td className="mono">{o.userId.slice(0, 8)}…</td>
                    <td>
                      <span className={`status status-${o.status}`}>
                        {StatusHelper.getStatusLabel(o.status, t)}
                      </span>
                    </td>
                    <td>{FormatHelper.formatMoney(o.totalAmount, o.currency)}</td>
                    <td>
                      {o.status === 'draft' ? (
                        <button
                          type="button"
                          className="button small"
                          disabled={payingId === o.id}
                          onClick={() => {
                            handleMarkPaid(o.id);
                          }}
                        >
                          {payingId === o.id ? t('orders.markPaidProgress') : t('orders.markPaid')}
                        </button>
                      ) : (
                        <span className="admin-table-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
