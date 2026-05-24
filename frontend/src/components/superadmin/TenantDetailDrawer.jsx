import { X, ExternalLink } from 'lucide-react';
import { StatusPill, PlanPill } from '../../pages/superadmin/SuperAdminTenantsPage';

const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';

const Field = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-400 mb-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>{label}</p>
    <p className="text-sm text-gray-800 font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>{value || '—'}</p>
  </div>
);

export default function TenantDetailDrawer({ tenant, onClose, onAction }) {
  const shopUrl = `${FRONTEND_URL}/s/${tenant.slug}`;
  const adminUrl = `${FRONTEND_URL}/s/${tenant.slug}/admin/login`;
  const days = tenant.planExpiryDate
    ? Math.max(0, Math.ceil((new Date(tenant.planExpiryDate) - new Date()) / 86400000))
    : null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h3 className="text-base font-semibold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{tenant.businessName}</h3>
            <p className="text-xs text-gray-400 font-mono mt-0.5">/s/{tenant.slug}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Status + Plan pills */}
          <div className="flex gap-2">
            <StatusPill status={tenant.status} />
            <PlanPill plan={tenant.plan} />
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Owner" value={tenant.ownerName} />
            <Field label="Business Type" value={tenant.businessType?.replace('_', ' ')} />
            <Field label="Email" value={tenant.email} />
            <Field label="Mobile" value={tenant.mobile} />
            <Field label="Expiry" value={tenant.planExpiryDate ? new Date(tenant.planExpiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'} />
            <Field label="Days Remaining" value={days !== null ? `${days} days` : '—'} />
            <Field label="Joined" value={tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString('en-IN') : '—'} />
          </div>

          {/* Links */}
          <div className="space-y-2">
            <a href={shopUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-violet-600 hover:text-violet-800 transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}>
              <ExternalLink size={14} /> View Public Shop
            </a>
            <a href={adminUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-violet-600 hover:text-violet-800 transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}>
              <ExternalLink size={14} /> Open Admin Dashboard
            </a>
          </div>

          {/* Actions */}
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>Actions</p>
            <div className="space-y-2">
              {[
                { key: 'adjustDays', label: 'Adjust Days' },
                { key: 'changePlan', label: 'Change Plan' },
                { key: 'changeSlug', label: 'Change Slug' },
                { key: 'bypassPayment', label: 'Bypass Payment' },
                tenant.status !== 'paused' && { key: 'pause', label: 'Pause' },
                tenant.status === 'paused' && { key: 'unpause', label: 'Unpause' },
                tenant.status !== 'inactive' && { key: 'deactivate', label: 'Deactivate', danger: true },
                tenant.status === 'inactive' && { key: 'activate', label: 'Activate' },
                { key: 'deleteTenant', label: 'Delete Tenant', danger: true },
              ].filter(Boolean).map(a => (
                <button key={a.key}
                  onClick={() => { onClose(); onAction(a.key, tenant); }}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm border transition-colors ${a.danger ? 'border-red-100 text-red-600 hover:bg-red-50' : 'border-gray-100 text-gray-700 hover:bg-gray-50'}`}
                  style={{ fontFamily: "'Inter', sans-serif" }}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}