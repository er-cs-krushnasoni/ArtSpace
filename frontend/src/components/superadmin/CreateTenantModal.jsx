import { useState, useEffect, useRef } from 'react';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import api from '../../api/axiosInstance';

const BUSINESS_TYPES = [
  { value: 'nail_art', label: 'Nail Art' },
  { value: 'mehendi', label: 'Mehendi' },
  { value: 'jewellery', label: 'Jewellery' },
  { value: 'cake', label: 'Cake Shop' },
  { value: 'generic', label: 'Generic' },
];

const PLAN_OPTIONS = [
  { value: 'trial', label: 'Free Trial (7 days)' },
  { value: '1m', label: '1 Month' },
  { value: '3m', label: '3 Months' },
  { value: '6m', label: '6 Months' },
  { value: '12m', label: '12 Months' },
  { value: 'custom', label: 'Custom Days' },
];

export default function CreateTenantModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    businessName: '', slug: '', businessType: 'generic',
    ownerName: '', email: '', mobile: '',
    initialPassword: '', plan: 'trial', customDays: '',
  });
  const [slugAvailable, setSlugAvailable] = useState(null);
  const [checking, setChecking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const debounceRef = useRef(null);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  // Auto-generate slug from business name
  useEffect(() => {
    if (form.businessName && !form.slug) {
      const auto = form.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      setForm(f => ({ ...f, slug: auto }));
    }
  }, [form.businessName]);

  // Check slug availability
  useEffect(() => {
    if (!form.slug) { setSlugAvailable(null); return; }
    setChecking(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/superadmin/tenants/check-slug?slug=${form.slug}`);
        setSlugAvailable(res.data.available);
      } catch { setSlugAvailable(null); }
      finally { setChecking(false); }
    }, 500);
  }, [form.slug]);

  const submit = async () => {
    const required = ['businessName', 'slug', 'ownerName', 'email', 'mobile', 'initialPassword'];
    for (const f of required) {
      if (!form[f].trim()) return setError(`${f} is required`);
    }
    if (slugAvailable === false) return setError('Slug is not available');
    if (form.plan === 'custom' && (!form.customDays || form.customDays < 1)) return setError('Enter valid custom days');
    setError('');
    setLoading(true);
    try {
      await api.post('/superadmin/tenants', {
        ...form,
        ...(form.plan === 'custom' && { customDays: Number(form.customDays) }),
      });
      onSuccess('Tenant created and credentials emailed');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create tenant');
    } finally { setLoading(false); }
  };

  const inputClass = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300";
  const labelClass = "block text-xs font-medium text-gray-500 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto z-10">
        <div className="sticky top-0 bg-white px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Create Tenant</h2>
          <p className="text-sm text-gray-400 mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>Credentials will be emailed to the shop owner</p>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelClass} style={{ fontFamily: "'Inter', sans-serif" }}>Business Name *</label>
              <input className={inputClass} style={{ fontFamily: "'Inter', sans-serif" }} placeholder="e.g. Glamour Nails" value={form.businessName} onChange={set('businessName')} />
            </div>
            <div className="col-span-2">
              <label className={labelClass} style={{ fontFamily: "'Inter', sans-serif" }}>Shop URL (Slug) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">/s/</span>
                <input
                  className={`${inputClass} pl-9 pr-8`} style={{ fontFamily: "'Inter', sans-serif" }}
                  placeholder="glamournails"
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {checking && <Loader2 size={13} className="animate-spin text-gray-400" />}
                  {!checking && slugAvailable === true && <CheckCircle size={13} className="text-green-500" />}
                  {!checking && slugAvailable === false && <XCircle size={13} className="text-red-500" />}
                </div>
              </div>
              {slugAvailable === false && <p className="text-xs text-red-500 mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>Not available</p>}
            </div>
            <div>
              <label className={labelClass} style={{ fontFamily: "'Inter', sans-serif" }}>Business Type *</label>
              <select className={`${inputClass} bg-white`} style={{ fontFamily: "'Inter', sans-serif" }} value={form.businessType} onChange={set('businessType')}>
                {BUSINESS_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass} style={{ fontFamily: "'Inter', sans-serif" }}>Owner Name *</label>
              <input className={inputClass} style={{ fontFamily: "'Inter', sans-serif" }} placeholder="Full name" value={form.ownerName} onChange={set('ownerName')} />
            </div>
            <div>
              <label className={labelClass} style={{ fontFamily: "'Inter', sans-serif" }}>Email *</label>
              <input type="email" className={inputClass} style={{ fontFamily: "'Inter', sans-serif" }} placeholder="owner@example.com" value={form.email} onChange={set('email')} />
            </div>
            <div>
              <label className={labelClass} style={{ fontFamily: "'Inter', sans-serif" }}>Mobile *</label>
              <input className={inputClass} style={{ fontFamily: "'Inter', sans-serif" }} placeholder="10-digit number" value={form.mobile} onChange={set('mobile')} />
            </div>
            <div>
              <label className={labelClass} style={{ fontFamily: "'Inter', sans-serif" }}>Initial Password *</label>
              <input type="password" className={inputClass} style={{ fontFamily: "'Inter', sans-serif" }} placeholder="Min 6 characters" value={form.initialPassword} onChange={set('initialPassword')} />
            </div>
            <div>
              <label className={labelClass} style={{ fontFamily: "'Inter', sans-serif" }}>Plan *</label>
              <select className={`${inputClass} bg-white`} style={{ fontFamily: "'Inter', sans-serif" }} value={form.plan} onChange={set('plan')}>
                {PLAN_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            {form.plan === 'custom' && (
              <div>
                <label className={labelClass} style={{ fontFamily: "'Inter', sans-serif" }}>Custom Days *</label>
                <input type="number" min="1" className={inputClass} style={{ fontFamily: "'Inter', sans-serif" }} placeholder="e.g. 45" value={form.customDays} onChange={set('customDays')} />
              </div>
            )}
          </div>

          {error && <p className="text-xs text-red-500" style={{ fontFamily: "'Inter', sans-serif" }}>{error}</p>}
        </div>

        <div className="sticky bottom-0 bg-white px-6 pb-6 pt-4 border-t border-gray-100 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>Cancel</button>
          <button onClick={submit} disabled={loading}
            className="px-4 py-2 text-sm rounded-lg font-medium text-white flex items-center gap-2"
            style={{ backgroundColor: '#8b5cf6', fontFamily: "'Inter', sans-serif" }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#7c3aed'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#8b5cf6'}>
            {loading && <Loader2 size={14} className="animate-spin" />}
            Create & Email Credentials
          </button>
        </div>
      </div>
    </div>
  );
}