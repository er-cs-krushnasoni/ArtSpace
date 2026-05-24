import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import api from '../../api/axiosInstance';

const PLAN_OPTIONS = [
  { value: '1m', label: '1 Month (30 days)' },
  { value: '3m', label: '3 Months (90 days)' },
  { value: '6m', label: '6 Months (180 days)' },
  { value: '12m', label: '12 Months (365 days)' },
  { value: 'custom', label: 'Custom Days' },
];

export default function BypassPaymentModal({ tenant, onClose, onSuccess }) {
  const [plan, setPlan] = useState('1m');
  const [customDays, setCustomDays] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!reason.trim()) return setError('Reason is mandatory for payment bypass');
    if (plan === 'custom' && (!customDays || customDays < 1)) return setError('Enter valid custom days');
    setError('');
    setLoading(true);
    try {
      await api.patch(`/superadmin/tenants/${tenant._id}/bypass-payment`, {
        plan, reason,
        amount: amount ? Number(amount) : 0,
        ...(plan === 'custom' && { customDays: Number(customDays) }),
      });
      onSuccess(`Payment bypassed for ${tenant.businessName} — ${plan} activated`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 z-10">
        <h2 className="text-base font-semibold text-gray-900 mb-0.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Bypass Payment</h2>
        <p className="text-sm text-gray-400 mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>{tenant.businessName}</p>
        <p className="text-xs text-amber-600 mb-5" style={{ fontFamily: "'Inter', sans-serif" }}>⚠️ This action is immutably logged in the audit trail</p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5" style={{ fontFamily: "'Inter', sans-serif" }}>Plan to Activate</label>
            <select value={plan} onChange={e => setPlan(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white"
              style={{ fontFamily: "'Inter', sans-serif" }}>
              {PLAN_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          {plan === 'custom' && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5" style={{ fontFamily: "'Inter', sans-serif" }}>Number of Days</label>
              <input type="number" min="1" placeholder="e.g. 45"
                value={customDays} onChange={e => setCustomDays(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300"
                style={{ fontFamily: "'Inter', sans-serif" }} />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5" style={{ fontFamily: "'Inter', sans-serif" }}>Amount Collected (₹, optional)</label>
            <input type="number" min="0" placeholder="e.g. 999"
              value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300"
              style={{ fontFamily: "'Inter', sans-serif" }} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5" style={{ fontFamily: "'Inter', sans-serif" }}>
              Reason <span className="text-red-400">*</span>
            </label>
            <textarea rows={3} placeholder="e.g. Cash payment collected in person on 23 May 2026"
              value={reason} onChange={e => setReason(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none"
              style={{ fontFamily: "'Inter', sans-serif" }} />
          </div>
          {error && <p className="text-xs text-red-500" style={{ fontFamily: "'Inter', sans-serif" }}>{error}</p>}
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>Cancel</button>
          <button onClick={submit} disabled={loading}
            className="px-4 py-2 text-sm rounded-lg font-medium text-white flex items-center gap-2"
            style={{ backgroundColor: '#8b5cf6', fontFamily: "'Inter', sans-serif" }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#7c3aed'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#8b5cf6'}>
            {loading && <Loader2 size={14} className="animate-spin" />}
            Bypass & Activate
          </button>
        </div>
      </div>
    </div>
  );
}