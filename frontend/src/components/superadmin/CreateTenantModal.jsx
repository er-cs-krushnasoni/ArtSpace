import { useState, useEffect, useRef } from 'react';
import { Loader2, CheckCircle, XCircle, ChevronDown } from 'lucide-react';
import api from '../../api/axiosInstance';
import { BUSINESS_TYPE_OPTIONS } from '../../config/businessTypeLabels';

/* ── Plan meta (mirrors SignupPage) ── */
const PLAN_ORDER = ['trial', '1m', '3m', '6m', '12m', 'custom'];
const PLAN_META = {
  trial:  { label: 'Free Trial (7 days)',  duration: '7 days'   },
  '1m':   { label: '1 Month',             duration: '30 days'  },
  '3m':   { label: '3 Months',            duration: '90 days'  },
  '6m':   { label: '6 Months',            duration: '180 days' },
  '12m':  { label: '12 Months',           duration: '365 days' },
  custom: { label: 'Custom Days',         duration: 'You pick' },
};

/* ── Searchable Business Type Dropdown (same as SignupPage) ── */
function BusinessTypeSelect({ value, onChange, error }) {
  const [open,  setOpen]  = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);
  const searchRef    = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false); setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { if (open && searchRef.current) searchRef.current.focus(); }, [open]);

  const filtered = query.trim()
    ? BUSINESS_TYPE_OPTIONS.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : BUSINESS_TYPE_OPTIONS;

  const selectedLabel = BUSINESS_TYPE_OPTIONS.find(o => o.value === value)?.label || '';

  const handleSelect = (val) => {
    onChange(val);
    setOpen(false); setQuery('');
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`w-full px-3 py-2 rounded-lg border text-sm text-left flex items-center justify-between transition-all focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
        } ${!selectedLabel ? 'text-gray-400' : 'text-gray-900'}`}
      >
        <span>{selectedLabel || 'Select business type…'}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search…"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300"
            />
          </div>
          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.map(opt => (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                    value === opt.value
                      ? 'bg-violet-50 text-violet-700 font-medium'
                      : 'text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                </button>
              </li>
            ))}
            {query.trim() && filtered.length === 0 && (
              <li>
                <button
                  type="button"
                  onClick={() => handleSelect('generic')}
                  className="w-full text-left px-3 py-2 text-sm text-violet-600 hover:bg-violet-50 font-medium flex items-center gap-2"
                >
                  <span className="text-violet-400">+</span>
                  Use as Generic
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   MAIN
════════════════════════════════════════ */
export default function CreateTenantModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    businessName: '', slug: '', businessType: '',
    ownerName: '', email: '', mobile: '',
    initialPassword: '', plan: 'trial', customDays: '',
  });
  const [slugAvailable, setSlugAvailable] = useState(null);
  const [checking,      setChecking]      = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState('');
  const [pricing,       setPricing]       = useState({});
  const [planEnabled,   setPlanEnabled]   = useState({});
  const [pricingLoaded, setPricingLoaded] = useState(false);
  const debounceRef = useRef(null);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  /* ── Fetch live pricing ── */
  useEffect(() => {
    api.get('/subscription/pricing')
      .then(res => { setPricing(res.data.pricing || {}); setPlanEnabled(res.data.enabled || {}); })
      .catch(() => {})
      .finally(() => setPricingLoaded(true));
  }, []);

  /* ── Auto-generate slug from business name ── */
  useEffect(() => {
    if (form.businessName && !form.slug) {
      const auto = form.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      setForm(f => ({ ...f, slug: auto }));
    }
  }, [form.businessName]);

  /* ── Check slug availability ── */
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

  /* ── Filtered plan list (same logic as SignupPage) ── */
  const PLAN_OPTIONS = PLAN_ORDER.filter(p => {
    if (p === 'trial') return true;
    const key = p === 'custom' ? 'custom_daily' : p;
    return planEnabled[key] !== false;
  });

  /* ── Price label ── */
  const priceLabel = (plan) => {
    if (plan === 'trial')  return 'Free';
    if (plan === 'custom') {
      const r = pricing['custom_daily'];
      return r ? `₹${r}/day` : '—';
    }
    const p = pricing[plan];
    return p ? `₹${p}` : '—';
  };

  const submit = async () => {
    const required = ['businessName', 'slug', 'businessType', 'ownerName', 'email', 'mobile', 'initialPassword'];
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

        {/* Header */}
        <div className="sticky top-0 bg-white px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Create Tenant</h2>
          <p className="text-sm text-gray-400 mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>Credentials will be emailed to the shop owner</p>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">

            {/* Business Name */}
            <div className="col-span-2">
              <label className={labelClass} style={{ fontFamily: "'Inter', sans-serif" }}>Business Name *</label>
              <input className={inputClass} style={{ fontFamily: "'Inter', sans-serif" }} placeholder="e.g. Glamour Nails" value={form.businessName} onChange={set('businessName')} />
            </div>

            {/* Slug */}
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
                  {!checking && slugAvailable === true  && <CheckCircle size={13} className="text-green-500" />}
                  {!checking && slugAvailable === false && <XCircle size={13} className="text-red-500" />}
                </div>
              </div>
              {slugAvailable === false && <p className="text-xs text-red-500 mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>Not available</p>}
            </div>

            {/* Business Type — searchable */}
            <div className="col-span-2">
              <label className={labelClass} style={{ fontFamily: "'Inter', sans-serif" }}>Business Type *</label>
              <BusinessTypeSelect
                value={form.businessType}
                onChange={(val) => setForm(f => ({ ...f, businessType: val }))}
                error={!form.businessType && error}
              />
            </div>

            {/* Owner Name */}
            <div>
              <label className={labelClass} style={{ fontFamily: "'Inter', sans-serif" }}>Owner Name *</label>
              <input className={inputClass} style={{ fontFamily: "'Inter', sans-serif" }} placeholder="Full name" value={form.ownerName} onChange={set('ownerName')} />
            </div>

            {/* Email */}
            <div>
              <label className={labelClass} style={{ fontFamily: "'Inter', sans-serif" }}>Email *</label>
              <input type="email" className={inputClass} style={{ fontFamily: "'Inter', sans-serif" }} placeholder="owner@example.com" value={form.email} onChange={set('email')} />
            </div>

            {/* Mobile */}
            <div>
              <label className={labelClass} style={{ fontFamily: "'Inter', sans-serif" }}>Mobile *</label>
              <input className={inputClass} style={{ fontFamily: "'Inter', sans-serif" }} placeholder="10-digit number" value={form.mobile} onChange={set('mobile')} />
            </div>

            {/* Initial Password */}
            <div>
              <label className={labelClass} style={{ fontFamily: "'Inter', sans-serif" }}>Initial Password *</label>
              <input type="password" className={inputClass} style={{ fontFamily: "'Inter', sans-serif" }} placeholder="Min 6 characters" value={form.initialPassword} onChange={set('initialPassword')} />
            </div>

            {/* Plan — live pricing */}
            <div className="col-span-2">
              <label className={labelClass} style={{ fontFamily: "'Inter', sans-serif" }}>Plan *</label>
              {!pricingLoaded ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-10 rounded-lg bg-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {PLAN_OPTIONS.map(plan => {
                    const meta = PLAN_META[plan];
                    const isSelected = form.plan === plan;
                    return (
                      <button
                        key={plan}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, plan, customDays: '' }))}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all text-sm ${
                          isSelected
                            ? 'border-violet-500 bg-violet-50 ring-1 ring-violet-200'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        <div className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                          isSelected ? 'border-violet-600' : 'border-gray-300'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-violet-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-gray-900">{meta.label}</span>
                          <span className="text-gray-400 ml-1.5 text-xs">· {meta.duration}</span>
                        </div>
                        <span className={`text-sm font-semibold flex-shrink-0 ${plan === 'trial' ? 'text-green-600' : 'text-violet-600'}`}>
                          {priceLabel(plan)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Custom Days */}
            {form.plan === 'custom' && (
              <div className="col-span-2 space-y-2">
                <label className={labelClass} style={{ fontFamily: "'Inter', sans-serif" }}>Custom Days *</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number" min="1"
                    className={`${inputClass} flex-1`} style={{ fontFamily: "'Inter', sans-serif" }}
                    placeholder="e.g. 45"
                    value={form.customDays}
                    onChange={e => setForm(f => ({ ...f, customDays: e.target.value.replace(/[^0-9]/g, '') }))}
                  />
                  <span className="text-sm text-gray-400 whitespace-nowrap">days</span>
                </div>
                {form.customDays && parseInt(form.customDays, 10) > 0 && pricing['custom_daily'] && (
                  <div className="bg-violet-50 border border-violet-100 rounded-lg px-3 py-2">
                    <p className="text-sm font-semibold text-violet-700" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {form.customDays} days × ₹{pricing['custom_daily']}/day = ₹{parseInt(form.customDays, 10) * pricing['custom_daily']}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {error && <p className="text-xs text-red-500" style={{ fontFamily: "'Inter', sans-serif" }}>{error}</p>}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white px-6 pb-6 pt-4 border-t border-gray-100 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>Cancel</button>
          <button
            onClick={submit}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-lg font-medium text-white flex items-center gap-2 disabled:opacity-60"
            style={{ backgroundColor: '#8b5cf6', fontFamily: "'Inter', sans-serif" }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#7c3aed'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#8b5cf6'}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Create & Email Credentials
          </button>
        </div>
      </div>
    </div>
  );
}