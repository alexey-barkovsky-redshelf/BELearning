import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, type AdminUserRow, type Order } from '../api/client';
import { useTranslation } from '../context/LocaleContext';
import { useUser } from '../context/UserContext';
import { useAsync } from '../hooks/useAsync';
import { StatusHelper } from '../utils/statusHelper';
import { FormatHelper } from '../utils/formatHelper';

export function Admin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isLoggedIn, isAdmin } = useUser();
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login?return=/admin');
      return;
    }
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, isLoggedIn, navigate]);

  const {
    data: users,
    loading: loadingUsers,
    error: usersError,
    refetch: refetchUsers,
  } = useAsync<AdminUserRow[]>(
    () => api.adminListUsers(),
    [isAdmin],
    { enabled: isLoggedIn && isAdmin, onError: () => t('errors.loadFailed') }
  );

  const {
    data: orders,
    loading: loadingOrders,
    error: ordersError,
    refetch: refetchOrders,
  } = useAsync<Order[]>(
    () => api.adminListOrders(),
    [isAdmin],
    { enabled: isLoggedIn && isAdmin, onError: () => t('errors.loadFailed') }
  );

  const handleMarkPaid = (orderId: string) => {
    setPayError(null);
    setPayingId(orderId);
    api
      .markOrderPaid(orderId)
      .then(() => {
        refetchOrders();
      })
      .catch((e) => {
        setPayError(e instanceof Error ? e.message : t('errors.markPaidFailed'));
      })
      .finally(() => {
        setPayingId(null);
      });
  };

  const handleRefresh = () => {
    setPayError(null);
    refetchUsers();
    refetchOrders();
  };

  if (!isLoggedIn || !isAdmin) {
    return null;
  }

  const userRows = users ?? [];
  const orderRows = orders ?? [];

  return (
    <div className="page admin-page">
      <h1>{t('admin.title')}</h1>
      <p className="admin-hint">{t('admin.accountsHint')}</p>

      <div className="admin-section-header" style={{ marginBottom: 'var(--space-6)' }}>
        <button type="button" className="button" onClick={handleRefresh}>
          {t('admin.refresh')}
        </button>
      </div>

      {payError ? <p className="error">{payError}</p> : null}

      <section className="admin-section">
        <div className="admin-section-header">
          <h2>{t('admin.usersTitle')}</h2>
        </div>
        {usersError ? <p className="error">{usersError}</p> : null}
        {loadingUsers ? <p className="loading">{t('common.loading')}</p> : null}
        {!loadingUsers && !usersError ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t('admin.colLogin')}</th>
                  <th>{t('admin.colRole')}</th>
                  <th>{t('admin.colId')}</th>
                  <th>{t('admin.colCreated')}</th>
                </tr>
              </thead>
              <tbody>
                {userRows.map((u) => (
                  <tr key={u.id}>
                    <td>{u.loginId}</td>
                    <td>{u.role}</td>
                    <td className="mono">{u.id.slice(0, 8)}…</td>
                    <td className="mono">{u.createdAt.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <section className="admin-section">
        <div className="admin-section-header">
          <h2>{t('admin.ordersTitle')}</h2>
        </div>
        {ordersError ? <p className="error">{ordersError}</p> : null}
        {loadingOrders ? <p className="loading">{t('common.loading')}</p> : null}
        {!loadingOrders && !ordersError ? (
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
                    <td className="mono">{o.id.slice(0, 8)}…</td>
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
        ) : null}
      </section>
    </div>
  );
}
