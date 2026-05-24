import { useState, useEffect, useRef } from 'react';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import api from '../../api/axiosInstance';

export default function ChangeSlugModal({ tenant, onClose, onSuccess }) {
  const [slug, setSlug] = useState(tenant.slug);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState(null);
  const [error, setError] = useState('');
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!slug || slug === tenant.slug) { setAvailable(null); return; }
    setChecking(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/superadmin/tenants/check-slug?slug=${slug}&excludeId=${tenant._id}`);
        setAvailable(res.data.available);
      } catch { setAvailable(null); }
      finally { setChecking(false); }
    }, 500);
  }, [slug, tenant.slug, tenant._id]);

  const submit = async () => {
    if (!slug.trim()) return setError('Slug is required');
    if (available === false) return setError('Slug is not available');
    setError('');
    setLoading(true);
    try {
      await api.patch(`/superadmin/tenants/${tenant._id}/slug`, { slug, reason });
      onSuccess(`Slug changed to /s/${slug}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 z-10">
        <h2 className="text-base font-semibold text-gray-900 mb-0.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Change Slug</h2>
        <p className="text-sm text-gray-400 mb-5" style={{ fontFamily: "'Inter', sans-serif" }}>{tenant.businessName} — current: /s/{tenant.slug}</p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5" style={{ fontFamily: "'Inter', sans-serif" }}>New Slug</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400" style={{ fontFamily: "'Inter', sans-serif" }}>/s/</span>
              <input
                type="text"
                value={slug}
                onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="w-full pl-9 pr-10 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {checking && <Loader2 size={14} className="animate-spin text-gray-400" />}
                {!checking && available === true && <CheckCircle size={14} className="text-green-500" />}
                {!checking && available === false && <XCircle size={14} className="text-red-500" />}
              </div>
            </div>
            {available === false && <p className="text-xs text-red-500 mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>This slug is taken or reserved</p>}
            {available === true && <p className="text-xs text-green-600 mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>Slug is available</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5" style={{ fontFamily: "'Inter', sans-serif" }}>Reason (optional)</label>
            <input
              type="text"
              placeholder="Reason for slug change"
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300"
              style={{ fontFamily: "'Inter', sans-serif" }}
            />
          </div>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
            <p className="text-xs text-amber-700" style={{ fontFamily: "'Inter', sans-serif" }}>
              ⚠️ The old shop URL will stop working immediately. The tenant will be emailed their new URL.
            </p>
          </div>
          {error && <p className="text-xs text-red-500" style={{ fontFamily: "'Inter', sans-serif" }}>{error}</p>}
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>Cancel</button>
          <button onClick={submit} disabled={loading || available === false}
            className="px-4 py-2 text-sm rounded-lg font-medium text-white flex items-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: '#8b5cf6', fontFamily: "'Inter', sans-serif" }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#7c3aed'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#8b5cf6'}>
            {loading && <Loader2 size={14} className="animate-spin" />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}