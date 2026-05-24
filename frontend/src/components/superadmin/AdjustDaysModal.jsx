import { useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import api from '../../api/axiosInstance';

export default function AdjustDaysModal({ tenant, onClose, onSuccess }) {
  const [days, setDays] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showExpiryWarning, setShowExpiryWarning] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);

  const submit = async (confirmExpiry = false) => {
    if (!days || isNaN(days)) return setError('Enter a valid number of days');
    if (!reason.trim()) return setError('Reason is required');
    setError('');
    setLoading(true);
    try {
      const payload = { days: Number(days), reason, ...(confirmExpiry && { confirmExpiry: true }) };
      await api.patch(`/superadmin/tenants/${tenant._id}/adjust-days`, payload);
      onSuccess(`Days adjusted by ${days > 0 ? '+' : ''}${days} for ${tenant.businessName}`);
    } catch (err) {
      if (err.response?.data?.code === 'CONFIRM_EXPIRY') {
        setPendingPayload({ days: Number(days), reason });
        setShowExpiryWarning(true);
      } else {
        setError(err.response?.data?.message || 'Failed to adjust days');
      }
    } finally {
      setLoading(false);
    }
  };

  const confirmExpiry = async () => {
    setShowExpiryWarning(false);
    setLoading(true);
    try {
      await api.patch(`/superadmin/tenants/${tenant._id}/adjust-days`, { ...pendingPayload, confirmExpiry: true });
      onSuccess(`Days adjusted — tenant subscription immediately expired`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 z-10">
        <h2 className="text-base font-semibold text-gray-900 mb-0.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Adjust Days</h2>
        <p className="text-sm text-gray-400 mb-5" style={{ fontFamily: "'Inter', sans-serif" }}>{tenant.businessName}</p>

        {showExpiryWarning ? (
          <div>
            <div className="flex gap-3 p-4 bg-red-50 rounded-xl border border-red-100 mb-5">
              <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700" style={{ fontFamily: "'Inter', sans-serif" }}>
                This adjustment will <strong>immediately expire</strong> this tenant's subscription. Their shop will go offline right now. Are you sure?
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowExpiryWarning(false)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                style={{ fontFamily: "'Inter', sans-serif" }}>
                Go Back
              </button>
              <button onClick={confirmExpiry} disabled={loading}
                className="px-4 py-2 text-sm rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 flex items-center gap-2"
                style={{ fontFamily: "'Inter', sans-serif" }}>
                {loading && <Loader2 size={14} className="animate-spin" />}
                Yes, Expire Now
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Days (use negative to reduce, e.g. −10)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 30 or -10"
                  value={days}
                  onChange={e => setDays(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />
                {days && !isNaN(days) && (
                  <p className="text-xs text-gray-400 mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Current expiry: {tenant.planExpiryDate ? new Date(tenant.planExpiryDate).toLocaleDateString('en-IN') : 'N/A'}
                    {' → '}New expiry: {tenant.planExpiryDate
                      ? new Date(new Date(tenant.planExpiryDate).getTime() + Number(days) * 86400000).toLocaleDateString('en-IN')
                      : 'N/A'}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Reason <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Mandatory — explain why you're adjusting days"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />
              </div>
              {error && <p className="text-xs text-red-500" style={{ fontFamily: "'Inter', sans-serif" }}>{error}</p>}
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={onClose}
                className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                style={{ fontFamily: "'Inter', sans-serif" }}>
                Cancel
              </button>
              <button onClick={() => submit(false)} disabled={loading}
                className="px-4 py-2 text-sm rounded-lg font-medium text-white flex items-center gap-2"
                style={{ backgroundColor: '#8b5cf6', fontFamily: "'Inter', sans-serif" }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#7c3aed'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#8b5cf6'}>
                {loading && <Loader2 size={14} className="animate-spin" />}
                Apply
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}