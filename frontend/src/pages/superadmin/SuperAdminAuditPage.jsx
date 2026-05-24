import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, ScrollText, ChevronLeft, ChevronRight, CreditCard } from 'lucide-react';
import SuperAdminLayout from '../../layouts/SuperAdminLayout';
import api from '../../api/axiosInstance';

const ACTION_LABELS = {
  PAYMENT_BYPASS: 'Payment Bypass',
  PLAN_CHANGE: 'Plan Change',
  EXPIRY_CHANGE: 'Expiry Adjusted',
  STATUS_CHANGE: 'Status Change',
  SLUG_CHANGE: 'Slug Change',
  TENANT_CREATED: 'Tenant Created',
  TENANT_DELETED: 'Tenant Deleted',
  TENANT_DEACTIVATED: 'Deactivated',
  TENANT_ACTIVATED: 'Activated',
  TENANT_PAUSED: 'Paused',
  TENANT_UNPAUSED: 'Unpaused',
  PASSWORD_RESET_BY_ADMIN: 'Password Reset',
};

const ACTION_COLORS = {
  PAYMENT_BYPASS: 'bg-amber-100 text-amber-700',
  PLAN_CHANGE: 'bg-violet-100 text-violet-700',
  EXPIRY_CHANGE: 'bg-blue-100 text-blue-700',
  TENANT_CREATED: 'bg-green-100 text-green-700',
  TENANT_DELETED: 'bg-red-100 text-red-700',
  TENANT_DEACTIVATED: 'bg-red-100 text-red-700',
  TENANT_ACTIVATED: 'bg-green-100 text-green-700',
  TENANT_PAUSED: 'bg-amber-100 text-amber-700',
  TENANT_UNPAUSED: 'bg-teal-100 text-teal-700',
  SLUG_CHANGE: 'bg-indigo-100 text-indigo-700',
  STATUS_CHANGE: 'bg-gray-100 text-gray-700',
};

const PAYMENT_STATUS_COLORS = {
  verified: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  failed: 'bg-red-100 text-red-700',
};

const PLAN_LABELS = {
  trial: 'Trial', '1m': '1 Month', '3m': '3 Months',
  '6m': '6 Months', '12m': '12 Months', custom: 'Custom',
};

// ─── Audit Log Tab ────────────────────────────────────────────────────────────
const AuditTab = ({ initialTenantId }) => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [tenantFilter, setTenantFilter] = useState(initialTenantId || '');
  const [actionFilter, setActionFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const LIMIT = 25;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (tenantFilter) params.set('tenantId', tenantFilter);
      if (actionFilter) params.set('actionType', actionFilter);
      if (fromDate) params.set('from', fromDate);
      if (toDate) params.set('to', toDate);
      const res = await api.get(`/superadmin/audit?${params}`);
      setLogs(res.data.logs);
      setTotal(res.data.total);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [page, tenantFilter, actionFilter, fromDate, toDate]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div>
      {/* Filters */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-center">
        <select value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white"
          style={{ fontFamily: "'Inter', sans-serif" }}>
          <option value="">All Actions</option>
          {Object.entries(ACTION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input type="date" value={fromDate} onChange={e => { setFromDate(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300"
          style={{ fontFamily: "'Inter', sans-serif" }} />
        <input type="date" value={toDate} onChange={e => { setToDate(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300"
          style={{ fontFamily: "'Inter', sans-serif" }} />
        {(tenantFilter || actionFilter || fromDate || toDate) && (
          <button onClick={() => { setTenantFilter(''); setActionFilter(''); setFromDate(''); setToDate(''); setPage(1); }}
            className="px-3 py-2 text-sm text-violet-600 hover:text-violet-800 transition-colors"
            style={{ fontFamily: "'Inter', sans-serif" }}>
            Clear filters
          </button>
        )}
        <span className="ml-auto text-xs text-gray-400" style={{ fontFamily: "'Inter', sans-serif" }}>{total} entries</span>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-violet-500" size={22} /></div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ScrollText className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>No audit entries found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {['Timestamp', 'Action', 'Tenant', 'Change', 'Reason'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide whitespace-nowrap"
                      style={{ fontFamily: "'Inter', sans-serif" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map(log => (
                  <tr key={log._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-700" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {new Date(log.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ACTION_COLORS[log.actionType] || 'bg-gray-100 text-gray-600'}`}
                        style={{ fontFamily: "'Inter', sans-serif" }}>
                        {ACTION_LABELS[log.actionType] || log.actionType}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {log.tenantId ? (
                        <div>
                          <p className="text-sm font-medium text-gray-800" style={{ fontFamily: "'Inter', sans-serif" }}>{log.tenantId.businessName || '—'}</p>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">/s/{log.tenantId.slug || '—'}</p>
                        </div>
                      ) : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      {log.oldValue || log.newValue ? (
                        <div className="space-y-0.5">
                          {log.oldValue && <p className="text-xs text-gray-400 line-through" style={{ fontFamily: "'Inter', sans-serif" }}>{log.oldValue}</p>}
                          {log.newValue && <p className="text-xs text-gray-700" style={{ fontFamily: "'Inter', sans-serif" }}>{log.newValue}</p>}
                        </div>
                      ) : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <p className="text-sm text-gray-600" style={{ fontFamily: "'Inter', sans-serif" }}>{log.reason || '—'}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400" style={{ fontFamily: "'Inter', sans-serif" }}>
              Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
            </p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 text-gray-500"><ChevronLeft size={16} /></button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 text-gray-500"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Payments Tab ─────────────────────────────────────────────────────────────
const PaymentsTab = () => {
  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const LIMIT = 25;

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (planFilter) params.set('plan', planFilter);
      if (statusFilter) params.set('status', statusFilter);
      if (fromDate) params.set('from', fromDate);
      if (toDate) params.set('to', toDate);
      const res = await api.get(`/superadmin/payments?${params}`);
      setPayments(res.data.payments);
      setTotal(res.data.total);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [page, planFilter, statusFilter, fromDate, toDate]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const totalPages = Math.ceil(total / LIMIT);

  // Revenue sum of verified payments on this page
  const pageRevenue = payments
    .filter(p => p.status === 'verified')
    .reduce((sum, p) => sum + (p.amount / 100), 0);

  return (
    <div>
      {/* Filters */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-center">
        <select value={planFilter} onChange={e => { setPlanFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white"
          style={{ fontFamily: "'Inter', sans-serif" }}>
          <option value="">All Plans</option>
          <option value="1m">1 Month</option>
          <option value="3m">3 Months</option>
          <option value="6m">6 Months</option>
          <option value="12m">12 Months</option>
          <option value="custom">Custom</option>
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white"
          style={{ fontFamily: "'Inter', sans-serif" }}>
          <option value="">All Statuses</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
        <input type="date" value={fromDate} onChange={e => { setFromDate(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300"
          style={{ fontFamily: "'Inter', sans-serif" }} />
        <input type="date" value={toDate} onChange={e => { setToDate(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300"
          style={{ fontFamily: "'Inter', sans-serif" }} />
        {(planFilter || statusFilter || fromDate || toDate) && (
          <button onClick={() => { setPlanFilter(''); setStatusFilter(''); setFromDate(''); setToDate(''); setPage(1); }}
            className="px-3 py-2 text-sm text-violet-600 hover:text-violet-800"
            style={{ fontFamily: "'Inter', sans-serif" }}>
            Clear
          </button>
        )}
        <div className="ml-auto flex items-center gap-4">
          <span className="text-xs text-gray-400" style={{ fontFamily: "'Inter', sans-serif" }}>{total} records</span>
          {pageRevenue > 0 && (
            <span className="text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full" style={{ fontFamily: "'Inter', sans-serif" }}>
              Page total: ₹{pageRevenue.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-violet-500" size={22} /></div>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <CreditCard className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>No payment records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {['Date', 'Tenant', 'Plan', 'Amount', 'Status', 'Razorpay Order ID'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide whitespace-nowrap"
                      style={{ fontFamily: "'Inter', sans-serif" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-700" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {new Date(p.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      {p.tenantId ? (
                        <div>
                          <p className="text-sm font-medium text-gray-800" style={{ fontFamily: "'Inter', sans-serif" }}>{p.tenantId.businessName}</p>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">/s/{p.tenantId.slug}</p>
                        </div>
                      ) : <span className="text-gray-400 text-sm">Deleted tenant</span>}
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <span className="text-sm font-medium text-gray-700" style={{ fontFamily: "'Inter', sans-serif" }}>
                          {PLAN_LABELS[p.plan] || p.plan}
                        </span>
                        {p.daysCount && (
                          <p className="text-xs text-gray-400 mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>{p.daysCount} days</p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
                        ₹{(p.amount / 100).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PAYMENT_STATUS_COLORS[p.status] || 'bg-gray-100 text-gray-600'}`}
                        style={{ fontFamily: "'Inter', sans-serif" }}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-gray-400 font-mono">{p.razorpayOrderId}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400" style={{ fontFamily: "'Inter', sans-serif" }}>
              Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
            </p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 text-gray-500"><ChevronLeft size={16} /></button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 text-gray-500"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SuperAdminAuditPage() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get('tab') === 'payments' ? 'payments' : 'audit'
  );
  const initialTenantId = searchParams.get('tenantId') || '';

  const tabs = [
    { key: 'audit', label: 'Audit Log', icon: ScrollText },
    { key: 'payments', label: 'Payments', icon: CreditCard },
  ];

  return (
    <SuperAdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {activeTab === 'payments' ? 'Payment Records' : 'Audit Log'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
            {activeTab === 'audit' ? 'Immutable record of all Super Admin actions' : 'All Razorpay payment records'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'audit' && <AuditTab initialTenantId={initialTenantId} />}
      {activeTab === 'payments' && <PaymentsTab />}
    </SuperAdminLayout>
  );
}