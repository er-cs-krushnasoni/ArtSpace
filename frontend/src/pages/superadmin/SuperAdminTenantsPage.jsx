import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  Building2, Search, MoreVertical, Plus, Loader2,
  ChevronLeft, ChevronRight, RefreshCw, Trash2, AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SuperAdminLayout from '../../layouts/SuperAdminLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';
import AdjustDaysModal from '../../components/superadmin/AdjustDaysModal';
import ChangeSlugModal from '../../components/superadmin/ChangeSlugModal';
import ChangePlanModal from '../../components/superadmin/ChangePlanModal';
import BypassPaymentModal from '../../components/superadmin/BypassPaymentModal';
import CreateTenantModal from '../../components/superadmin/CreateTenantModal';
import TenantDetailDrawer from '../../components/superadmin/TenantDetailDrawer';
import ConfirmDialog from '../../components/superadmin/ConfirmDialog';

// ─── Pill helpers (exported for reuse in drawer) ──────────────────────────────
export const StatusPill = ({ status }) => {
  const styles = {
    active: 'bg-green-100 text-green-800',
    expired: 'bg-red-100 text-red-800',
    paused: 'bg-amber-100 text-amber-800',
    inactive: 'bg-gray-100 text-gray-600',
    pending_manual: 'bg-blue-100 text-blue-800',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-600'}`}
      style={{ fontFamily: "'Inter', sans-serif" }}>
      {status?.replace('_', ' ')}
    </span>
  );
};

export const PlanPill = ({ plan }) => {
  const styles = {
    trial: 'bg-violet-100 text-violet-700',
    '1m': 'bg-blue-100 text-blue-700',
    '3m': 'bg-indigo-100 text-indigo-700',
    '6m': 'bg-cyan-100 text-cyan-700',
    '12m': 'bg-teal-100 text-teal-700',
    custom: 'bg-orange-100 text-orange-700',
  };
  const labels = { trial: 'Trial', '1m': '1 Month', '3m': '3 Months', '6m': '6 Months', '12m': '12 Months', custom: 'Custom' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[plan] || 'bg-gray-100 text-gray-600'}`}
      style={{ fontFamily: "'Inter', sans-serif" }}>
      {labels[plan] || plan}
    </span>
  );
};

const daysRemaining = (expiryDate) => {
  if (!expiryDate) return null;
  const diff = new Date(expiryDate) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

// ─── Portal dropdown — fixed position to escape overflow:hidden ───────────────
const ActionDropdown = ({ tenant, onAction }) => {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, opacity: 0 });
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const openMenu = (e) => {
    e.stopPropagation();
    const rect = btnRef.current.getBoundingClientRect();
    // Render off-screen first so we can measure real height
    setMenuPos({ top: -9999, left: -9999, opacity: 0 });
    setOpen(true);
    // After render, measure and reposition
    requestAnimationFrame(() => {
      if (!menuRef.current) return;
      const menuH = menuRef.current.offsetHeight;
      const menuW = menuRef.current.offsetWidth;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let top = rect.bottom + 4;
      let left = rect.right - menuW;

      if (top + menuH > vh - 8) top = rect.top - menuH - 4;
      if (top < 8) top = 8;
      if (left < 8) left = 8;
      if (left + menuW > vw - 8) left = vw - menuW - 8;

      setMenuPos({ top, left, opacity: 1 });
    });
  };

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  const actions = [
    { label: 'View Details', key: 'view' },
    null,
    tenant.status !== 'active' ? { label: 'Activate', key: 'activate' } : null,
    tenant.status === 'active' ? { label: 'Deactivate', key: 'deactivate', danger: true } : null,
    tenant.status !== 'paused' ? { label: 'Pause', key: 'pause' } : null,
    tenant.status === 'paused' ? { label: 'Unpause', key: 'unpause' } : null,
    null,
    { label: 'Change Plan', key: 'changePlan' },
    { label: 'Change Slug', key: 'changeSlug' },
    { label: 'Adjust Days', key: 'adjustDays' },
    { label: 'Bypass Payment', key: 'bypassPayment' },
    null,
    { label: 'View Audit Trail', key: 'audit' },
    null,
    { label: 'Delete Tenant', key: 'deleteTenant', danger: true },
  ].filter(Boolean);

  return (
    <>
      <button
        ref={btnRef}
        onClick={openMenu}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <MoreVertical size={16} />
      </button>

      {open && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <div
            ref={menuRef}
            className="fixed z-[9999] bg-white border border-gray-100 rounded-xl shadow-xl py-1 w-48"
            style={{
              top: menuPos.top,
              left: menuPos.left,
              opacity: menuPos.opacity,
              transition: 'opacity 0.08s ease',
            }}
          >
            {actions.map((a, i) =>
              a === null ? (
                <div key={i} className="border-t border-gray-100 my-1" />
              ) : (
                <button
                  key={a.key}
                  onClick={() => { setOpen(false); onAction(a.key, tenant); }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-gray-50 ${a.danger ? 'text-red-600' : 'text-gray-700'}`}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {a.label}
                </button>
              )
            )}
          </div>
        </>,
        document.body
      )}
    </>
  );
};

// ─── Delete Tenant confirmation modal (with reason) ───────────────────────────
const DeleteTenantModal = ({ tenant, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    await onConfirm(reason);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 z-10">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <AlertTriangle size={20} className="text-red-600" />
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Delete Tenant
        </h3>
        <p className="text-sm text-gray-500 mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
          Permanently delete <strong>{tenant.businessName}</strong> and all associated data — products, orders, tasks, images, and payment records. This cannot be undone.
        </p>
        <div className="p-3 bg-green-50 rounded-lg border border-green-100 mb-4">
          <p className="text-xs text-green-700" style={{ fontFamily: "'Inter', sans-serif" }}>
            ✓ The trial blacklist entry for this mobile number will be preserved, preventing future trial abuse.
          </p>
        </div>
        <div className="mb-5">
          <label className="block text-xs font-medium text-gray-500 mb-1.5" style={{ fontFamily: "'Inter', sans-serif" }}>
            Reason (optional)
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Duplicate account, policy violation…"
            value={reason}
            onChange={e => setReason(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
            style={{ fontFamily: "'Inter', sans-serif" }}
          />
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
            style={{ fontFamily: "'Inter', sans-serif" }}>
            Cancel
          </button>
          <button onClick={handle} disabled={loading}
            className="px-4 py-2 text-sm rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 flex items-center gap-2"
            style={{ fontFamily: "'Inter', sans-serif" }}>
            {loading && <Loader2 size={14} className="animate-spin" />}
            Delete Everything
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SuperAdminTenantsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [tenants, setTenants] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');

  const [activeModal, setActiveModal] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [drawerTenant, setDrawerTenant] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkPausing, setBulkPausing] = useState(false);
  const [bulkUnpausing, setBulkUnpausing] = useState(false);

  const LIMIT = 15;

  useEffect(() => {
    if (!authLoading && user?.role !== 'superadmin') navigate('/superadmin/login', { replace: true });
  }, [authLoading, user, navigate]);

  const fetchTenants = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      // "paid" is a frontend-only filter: exclude trial
      if (planFilter === 'paid') {
        params.set('excludePlan', 'trial');
      } else if (planFilter) {
        params.set('plan', planFilter);
      }
      const res = await api.get(`/superadmin/tenants?${params}`);
      setTenants(res.data.tenants);
      setTotal(res.data.total);
    } catch {
      toast.error('Failed to load tenants');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter, planFilter]);

  useEffect(() => { fetchTenants(); setSelectedIds(new Set()); }, [fetchTenants]);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleFilterChange = (setter) => (e) => { setter(e.target.value); setPage(1); };

  const handleAction = (key, tenant) => {
    if (key === 'view') { setDrawerTenant(tenant); return; }
    if (key === 'audit') { navigate(`/superadmin/audit?tenantId=${tenant._id}`); return; }
    if (key === 'deleteTenant') { setDeleteModal(tenant); return; }

    if (key === 'activate') {
      setConfirmDialog({
        title: 'Activate Tenant',
        message: `Activate ${tenant.businessName}? Their shop will go live immediately.`,
        variant: 'default',
        onConfirm: async () => {
          await api.patch(`/superadmin/tenants/${tenant._id}/status`, { status: 'active' });
          toast.success('Tenant activated');
          fetchTenants();
        },
      });
      return;
    }
    if (key === 'deactivate') {
      setConfirmDialog({
        title: 'Deactivate Tenant',
        message: `Deactivate ${tenant.businessName}? Their shop will go offline. This is a hard block — use Pause for temporary holds.`,
        variant: 'destructive',
        onConfirm: async () => {
          await api.patch(`/superadmin/tenants/${tenant._id}/status`, { status: 'inactive' });
          toast.success('Tenant deactivated');
          fetchTenants();
        },
      });
      return;
    }
    if (key === 'pause') {
      setConfirmDialog({
        title: 'Pause Tenant',
        message: `Pause ${tenant.businessName}? Their shop goes offline. Remaining subscription time is preserved and credited back on unpause.`,
        variant: 'default',
        onConfirm: async () => {
          await api.patch(`/superadmin/tenants/${tenant._id}/pause`);
          toast.success('Tenant paused');
          fetchTenants();
        },
      });
      return;
    }
    if (key === 'unpause') {
      setConfirmDialog({
        title: 'Unpause Tenant',
        message: `Unpause ${tenant.businessName}? Their exact paused duration will be credited back to their subscription.`,
        variant: 'default',
        onConfirm: async () => {
          await api.patch(`/superadmin/tenants/${tenant._id}/unpause`);
          toast.success('Tenant unpaused, time credited back');
          fetchTenants();
        },
      });
      return;
    }
    setActiveModal({ type: key, tenant });
  };

  const handleDeleteConfirm = async (reason) => {
    try {
      await api.delete(`/superadmin/tenants/${deleteModal._id}`, { data: { reason } });
      toast.success(`${deleteModal.businessName} deleted`);
      setDeleteModal(null);
      fetchTenants();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };
  // ─── Selection helpers ──────────────────────────────────────────────────────
  const toggleSelect = (id) => setSelectedIds(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const toggleSelectAll = () => {
    if (selectedIds.size === tenants.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(tenants.map(t => t._id)));
    }
  };

  const handleBulkPause = async () => {
    if (selectedIds.size === 0) return;
    setBulkPausing(true);
    let success = 0;
    let failed = 0;
    for (const id of selectedIds) {
      try {
        await api.patch(`/superadmin/tenants/${id}/pause`);
        success++;
      } catch {
        failed++;
      }
    }
    setBulkPausing(false);
    setSelectedIds(new Set());
    if (success > 0) toast.success(`${success} tenant${success > 1 ? 's' : ''} paused`);
    if (failed > 0) toast.error(`${failed} failed (may already be paused)`);
    fetchTenants();
  };

  const handleBulkUnpause = async () => {
  if (selectedIds.size === 0) return;
  setBulkUnpausing(true);
  let success = 0;
  let failed = 0;
  for (const id of selectedIds) {
    try {
      await api.patch(`/superadmin/tenants/${id}/unpause`);
      success++;
    } catch {
      failed++;
    }
  }
  setBulkUnpausing(false);
  setSelectedIds(new Set());
  if (success > 0) toast.success(`${success} tenant${success > 1 ? 's' : ''} unpaused, time credited back`);
  if (failed > 0) toast.error(`${failed} failed (may not be paused)`);
  fetchTenants();
};
  const closeModal = () => setActiveModal(null);
  const onSuccess = (msg) => { toast.success(msg); closeModal(); fetchTenants(); };
  const totalPages = Math.ceil(total / LIMIT);

  return (
    <SuperAdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Tenants</h1>
          <p className="text-sm text-gray-500 mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
            {total} shop{total !== 1 ? 's' : ''} registered
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchTenants} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors">
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => setActiveModal({ type: 'createTenant', tenant: null })}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: '#8b5cf6', fontFamily: "'Inter', sans-serif" }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#7c3aed'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#8b5cf6'}
          >
            <Plus size={16} /> Create Tenant
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or slug…"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300"
            style={{ fontFamily: "'Inter', sans-serif" }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={handleFilterChange(setStatusFilter)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="paused">Paused</option>
          <option value="inactive">Inactive</option>
        </select>
        <select
          value={planFilter}
          onChange={handleFilterChange(setPlanFilter)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <option value="">All Plans</option>
          <option value="paid">All Paid Plans</option>
          <option value="trial">Trial Only</option>
          <option value="1m">1 Month</option>
          <option value="3m">3 Months</option>
          <option value="6m">6 Months</option>
          <option value="12m">12 Months</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        {/* Bulk action bar — shown when items selected */}
      {selectedIds.size > 0 && (
        <div className="bg-violet-50 border border-violet-100 rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-violet-700" style={{ fontFamily: "'Inter', sans-serif" }}>
            {selectedIds.size} tenant{selectedIds.size > 1 ? 's' : ''} selected
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-1.5 text-xs rounded-lg border border-violet-200 text-violet-600 hover:bg-violet-100 transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Clear selection
            </button>
            <button
              onClick={handleBulkPause}
              disabled={bulkPausing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-medium text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-50 transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {bulkPausing && <Loader2 size={12} className="animate-spin" />}
              Pause Selected
            </button>
            <button
  onClick={handleBulkUnpause}
  disabled={bulkUnpausing}
  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-medium text-white bg-green-500 hover:bg-green-600 disabled:opacity-50 transition-colors"
  style={{ fontFamily: "'Inter', sans-serif" }}
>
  {bulkUnpausing && <Loader2 size={12} className="animate-spin" />}
  Unpause Selected
</button>
          </div>
        </div>
      )}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-violet-500" size={22} />
          </div>
        ) : tenants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Building2 className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>No tenants found</p>
            <p className="text-xs text-gray-400 mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>Try adjusting your filters</p>
          </div>
        ) : (
          /* No overflow-x-auto here — moved to inner div to prevent dropdown clipping */
          <div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="pl-5 pr-2 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={tenants.length > 0 && selectedIds.size === tenants.length}
                        ref={el => { if (el) el.indeterminate = selectedIds.size > 0 && selectedIds.size < tenants.length; }}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-400 cursor-pointer"
                      />
                    </th>
                    {['Business Name', 'Slug', 'Plan', 'Status', 'Expiry', 'Days Left', ''].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide whitespace-nowrap"
                        style={{ fontFamily: "'Inter', sans-serif" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {tenants.map(tenant => {
                    const days = daysRemaining(tenant.planExpiryDate);
                    return (
                      <tr
                        key={tenant._id}
                        className={`hover:bg-gray-50/60 transition-colors cursor-pointer ${selectedIds.has(tenant._id) ? 'bg-violet-50/40' : ''}`}
                        onClick={() => setDrawerTenant(tenant)}
                      >
                        <td className="pl-5 pr-2 py-3.5" onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(tenant._id)}
                            onChange={() => toggleSelect(tenant._id)}
                            className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-400 cursor-pointer"
                          />
                        </td>
                        <td className="px-5 py-3.5">
                          <div>
                            <p className="text-sm font-medium text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>{tenant.businessName}</p>
                            <p className="text-xs text-gray-400 mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>{tenant.ownerName}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-sm text-gray-500 font-mono">/s/{tenant.slug}</span>
                        </td>
                        <td className="px-5 py-3.5"><PlanPill plan={tenant.plan} /></td>
                        <td className="px-5 py-3.5"><StatusPill status={tenant.status} /></td>
                        <td className="px-5 py-3.5">
                          <span className="text-sm text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>
                            {tenant.planExpiryDate
                              ? new Date(tenant.planExpiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                              : '—'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          {days !== null ? (
                            <span className={`text-sm font-medium ${days <= 7 ? 'text-red-600' : days <= 30 ? 'text-amber-600' : 'text-gray-700'}`}
                              style={{ fontFamily: "'Inter', sans-serif" }}>
                              {days}d
                            </span>
                          ) : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                          <ActionDropdown tenant={tenant} onAction={handleAction} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400" style={{ fontFamily: "'Inter', sans-serif" }}>
              Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
            </p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 transition-colors text-gray-500">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 transition-colors text-gray-500">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {activeModal?.type === 'adjustDays' && <AdjustDaysModal tenant={activeModal.tenant} onClose={closeModal} onSuccess={onSuccess} />}
      {activeModal?.type === 'changeSlug' && <ChangeSlugModal tenant={activeModal.tenant} onClose={closeModal} onSuccess={onSuccess} />}
      {activeModal?.type === 'changePlan' && <ChangePlanModal tenant={activeModal.tenant} onClose={closeModal} onSuccess={onSuccess} />}
      {activeModal?.type === 'bypassPayment' && <BypassPaymentModal tenant={activeModal.tenant} onClose={closeModal} onSuccess={onSuccess} />}
      {activeModal?.type === 'createTenant' && <CreateTenantModal onClose={closeModal} onSuccess={onSuccess} />}
      {drawerTenant && <TenantDetailDrawer tenant={drawerTenant} onClose={() => setDrawerTenant(null)} onAction={handleAction} onRefresh={fetchTenants} />}
      {deleteModal && <DeleteTenantModal tenant={deleteModal} onClose={() => setDeleteModal(null)} onConfirm={handleDeleteConfirm} />}
      {confirmDialog && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          variant={confirmDialog.variant}
          onConfirm={async () => { await confirmDialog.onConfirm(); setConfirmDialog(null); }}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </SuperAdminLayout>
  );
}