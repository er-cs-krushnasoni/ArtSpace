import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Check, X, Loader2, ChevronDown, Mail, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { tokenStore } from '../../api/tokenStore';
import { BUSINESS_TYPE_OPTIONS } from '../../config/businessTypeLabels';

const COUNTRY_CODES = [
  { code: '+91',  label: '🇮🇳 +91' },
  { code: '+1',   label: '🇺🇸 +1' },
  { code: '+44',  label: '🇬🇧 +44' },
  { code: '+971', label: '🇦🇪 +971' },
  { code: '+65',  label: '🇸🇬 +65' },
  { code: '+61',  label: '🇦🇺 +61' },
];

const PLAN_ORDER = ['trial', '1m', '3m', '6m', '12m', 'custom'];
const PLAN_META = {
  trial:  { label: 'Free Trial',  duration: '7 days',   highlight: true,  desc: 'No card needed' },
  '1m':   { label: '1 Month',     duration: '30 days',  desc: 'Billed once' },
  '3m':   { label: '3 Months',    duration: '90 days',  desc: 'Billed once' },
  '6m':   { label: '6 Months',    duration: '180 days', desc: 'Billed once' },
  '12m':  { label: '12 Months',   duration: '365 days', desc: 'Best value' },
  custom: { label: 'Custom Days', duration: 'You pick', desc: 'Flexible' },
};

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const SlugStatus = ({ status }) => {
  if (status === 'checking')  return <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />;
  if (status === 'available') return <Check className="w-4 h-4 text-green-500" />;
  if (['taken', 'reserved', 'invalid'].includes(status)) return <X className="w-4 h-4 text-red-500" />;
  return null;
};

const slugStatusText = (status) => {
  if (status === 'available') return { text: 'Available ✓',                                     cls: 'text-green-600' };
  if (status === 'taken')     return { text: 'Already taken — try another',                     cls: 'text-red-500' };
  if (status === 'reserved')  return { text: 'Reserved word — choose another',                  cls: 'text-red-500' };
  if (status === 'invalid')   return { text: 'Lowercase letters, numbers, hyphens only (3–30)', cls: 'text-red-500' };
  return null;
};

/* ─── Searchable Business Type Dropdown ─── */
function BusinessTypeSelect({ value, onChange, options, error }) {
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
    ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  const selectedLabel = options.find(o => o.value === value)?.label || '';

  const handleSelect = (val) => {
    onChange({ target: { name: 'businessType', value: val } });
    setOpen(false); setQuery('');
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-left flex items-center justify-between transition-all focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
        } ${!selectedLabel ? 'text-gray-400' : 'text-gray-900'}`}
      >
        <span>{selectedLabel || 'Select your business type…'}</span>
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
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.map(opt => (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full text-left px-3.5 py-2 text-sm transition-colors ${
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
                  className="w-full text-left px-3.5 py-2 text-sm text-violet-600 hover:bg-violet-50 font-medium flex items-center gap-2"
                >
                  <span className="text-violet-400">+</span>
                  Use "{query}" as Other
                </button>
              </li>
            )}
            {!query.trim() && filtered.length === 0 && (
              <li className="px-3.5 py-3 text-sm text-gray-400 text-center">No results</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ─── Left Panel — benefits sidebar ─── */
function LeftPanel() {
  const perks = [
    { icon: Zap,      text: 'Live in under a minute' },
    { icon: Shield,   text: 'No commission on sales — ever' },
    { icon: Sparkles, text: 'Your brand, not ours' },
    { icon: Check,    text: '7-day free trial, no card' },
  ];
  return (
    <div className="hidden lg:flex flex-col justify-between h-full min-h-screen sticky top-0 bg-gradient-to-br from-violet-700 to-violet-900 px-10 py-12">
      <div>
        <Link to="/" className="flex items-center gap-2 mb-12">
          <img src="/artspace-logo.png" alt="ArtSpace" className="h-16 object-contain" />
          <span className="font-bold text-white text-base tracking-tight">ArtSpace</span>
        </Link>
        <h2 className="text-2xl font-bold text-white leading-snug mb-3">
          Your creative business,<br />beautifully online.
        </h2>
        <p className="text-violet-200 text-sm leading-relaxed mb-10">
          Join artists, bakers, jewellers, and 80+ other creative business types who built their shop on ArtSpace.
        </p>
        <div className="space-y-4">
          {perks.map(p => (
            <div key={p.text} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <p.icon className="w-4 h-4 text-violet-200" />
              </div>
              <span className="text-sm text-violet-100 font-medium">{p.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mini shop preview */}
      <div className="mt-10">
        <p className="text-xs text-violet-400 uppercase tracking-widest mb-3 font-semibold">What your shop looks like</p>
        <div className="bg-white rounded-2xl p-4 shadow-2xl">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold">GN</div>
            <div>
              <p className="text-xs font-semibold text-gray-800">Glamour Nails</p>
              <p className="text-xs text-gray-400">Mumbai · Nail Art</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1.5 mb-2">
            {[
              'from-pink-200 to-rose-300',
              'from-violet-200 to-purple-300',
              'from-amber-200 to-orange-300',
            ].map((c, i) => (
              <div key={i} className={`h-12 rounded-lg bg-gradient-to-br ${c}`} />
            ))}
          </div>
          <div className="bg-violet-600 rounded-lg py-1.5 text-center">
            <p className="text-xs text-white font-semibold">Order Now →</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main ─── */
export default function SignupPage() {
  const navigate  = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    businessName: '',
    slug:         '',
    businessType: '',
    ownerName:    '',
    email:        '',
    countryCode:  '+91',
    mobile:       '',
    password:     '',
    plan:         'trial',
    customDays:   '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [slugStatus,   setSlugStatus]   = useState(null);
  const [isLoading,    setIsLoading]    = useState(false);
  const [errors,       setErrors]       = useState({});
  const [pricing,      setPricing]      = useState({});
  const [planEnabled,  setPlanEnabled]  = useState({});
  const [pricingLoaded, setPricingLoaded] = useState(false);

  const debounceRef = useRef(null);
  const APP_URL     = import.meta.env.VITE_APP_URL || 'http://localhost:5173';

  useEffect(() => { document.title = 'Create Your Shop — ArtSpace'; }, []);

  const checkSlug = useCallback(async (value) => {
    if (!value || value.length < 3) { setSlugStatus(null); return; }
    if (!/^[a-z0-9-]+$/.test(value) || value.length > 30) { setSlugStatus('invalid'); return; }
    setSlugStatus('checking');
    try {
      const res = await api.get(`/tenantauth/check-slug?slug=${encodeURIComponent(value)}`);
      setSlugStatus(res.data.available ? 'available' : (res.data.reason || 'taken'));
    } catch { setSlugStatus(null); }
  }, []);

  useEffect(() => {
    api.get('/subscription/pricing')
      .then(res => { setPricing(res.data.pricing || {}); setPlanEnabled(res.data.enabled || {}); })
      .catch(() => {})
      .finally(() => setPricingLoaded(true));
  }, []);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const PLAN_OPTIONS = PLAN_ORDER.filter(p => {
    if (p === 'trial') return true;
    const key = p === 'custom' ? 'custom_daily' : p;
    return planEnabled[key] !== false;
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    let sanitized = value;
    if (name === 'slug')         sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (name === 'mobile')       sanitized = value.replace(/\D/g, '');
    if (name === 'businessName') sanitized = value.slice(0, 30);
    setForm(prev => ({ ...prev, [name]: sanitized }));
    if (errors[name]) setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    if (name === 'slug') {
      setSlugStatus(null);
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => checkSlug(sanitized), 500);
    }
  };

  const handleMobileKeyDown = (e) => {
    const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Enter'];
    if (allowed.includes(e.key) || e.ctrlKey || e.metaKey) return;
    if (!/^\d$/.test(e.key)) e.preventDefault();
  };

  const validate = () => {
    const e = {};
    if (!form.businessName.trim() || form.businessName.trim().length < 2)
      e.businessName = 'At least 2 characters.';
    if (!form.slug || form.slug.length < 3)
      e.slug = 'At least 3 characters.';
    if (slugStatus !== 'available')
      e.slug = 'Choose a valid, available shop URL.';
    if (!form.businessType)
      e.businessType = 'Please select a business type.';
    if (!form.ownerName.trim() || form.ownerName.trim().length < 2)
      e.ownerName = 'At least 2 characters.';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
      e.email = 'Enter a valid email.';
    if (!form.mobile || !/^\d{10,15}$/.test(form.mobile))
      e.mobile = '10–15 digits.';
    if (!form.password || form.password.length < 8)
      e.password = 'At least 8 characters.';
    if (form.plan === 'custom' && (!form.customDays || parseInt(form.customDays, 10) < 1))
      e.customDays = 'Enter a valid number of days.';
    return e;
  };

  const handleTrialSignup = async () => {
    const res = await api.post('/tenantauth/signup', {
      businessName: form.businessName.trim(),
      slug:         form.slug,
      businessType: form.businessType,
      ownerName:    form.ownerName.trim(),
      email:        form.email,
      mobile:       form.mobile,
      password:     form.password,
      plan:         'trial',
    });
    const { accessToken, user } = res.data;
    tokenStore.set(accessToken);
    login(accessToken, user);
    toast.success('Your shop is live! 🎉');
    navigate(`/s/${user.slug}/admin/dashboard/home`, { replace: true });
  };

  const handlePaidSignup = async () => {
    const loaded = await loadRazorpay();
    if (!loaded) { toast.error('Failed to load payment gateway. Check your connection.'); return; }
    let orderData;
    try {
      const res = await api.post('/tenantauth/signup-create-order', {
        businessName: form.businessName.trim(),
        slug:         form.slug,
        businessType: form.businessType,
        ownerName:    form.ownerName.trim(),
        email:        form.email,
        mobile:       form.mobile,
        password:     form.password,
        plan:         form.plan,
        ...(form.plan === 'custom' && { customDays: parseInt(form.customDays, 10) }),
      });
      orderData = res.data;
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to initiate payment.';
      if (msg.toLowerCase().includes('slug')) setErrors({ slug: msg });
      else if (msg.toLowerCase().includes('email')) setErrors({ email: msg });
      else toast.error(msg);
      return;
    }
    const planLabel = form.plan === 'custom'
      ? `${form.customDays} Day Custom Plan`
      : { '1m': '1 Month', '3m': '3 Months', '6m': '6 Months', '12m': '12 Months' }[form.plan];
    return new Promise((resolve) => {
      const options = {
        key:         orderData.keyId,
        amount:      orderData.amount,
        currency:    orderData.currency,
        order_id:    orderData.razorpayOrderId,
        name:        'ArtSpace',
        description: `${planLabel} Subscription`,
        handler: async (response) => {
          try {
            const verifyRes = await api.post('/tenantauth/signup-verify-payment', {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              pendingToken:        orderData.pendingToken,
            });
            const { accessToken, user } = verifyRes.data;
            tokenStore.set(accessToken);
            login(accessToken, user);
            toast.success('Payment successful! Your shop is live 🎉');
            navigate(`/s/${user.slug}/admin/dashboard`, { replace: true });
          } catch (err) {
            toast.error(err?.response?.data?.message || 'Payment verification failed. Contact support.');
          } finally { setIsLoading(false); resolve(); }
        },
        modal:  { ondismiss: () => { setIsLoading(false); resolve(); } },
        prefill: { email: form.email, contact: form.mobile },
        theme:   { color: '#8b5cf6' },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    setIsLoading(true);
    try {
      if (form.plan === 'trial') await handleTrialSignup();
      else await handlePaidSignup();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Something went wrong. Please try again.';
      if (msg.toLowerCase().includes('slug')) setErrors({ slug: msg });
      else if (msg.toLowerCase().includes('email')) setErrors({ email: msg });
      else if (msg.toLowerCase().includes('mobile')) setErrors({ mobile: msg });
      else toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-3.5 py-2.5 rounded-lg border text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all ${
      errors[field] ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
    }`;

  const slugInfo = slugStatusText(slugStatus);

  const priceLabel = (plan) => {
    if (plan === 'trial') return <span className="text-green-600 font-bold text-base">Free</span>;
    if (plan === 'custom') {
      const r = pricing['custom_daily'];
      return <span className="text-violet-600 font-bold text-base">{r ? `₹${r}/day` : '—'}</span>;
    }
    const p = pricing[plan];
    return <span className="text-gray-900 font-bold text-base">{p ? `₹${p}` : '—'}</span>;
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}>

      {/* Left panel — desktop only */}
      <div className="hidden lg:block w-[380px] flex-shrink-0">
        <LeftPanel />
      </div>

      {/* Right — form */}
            <div className="flex-1 min-w-0 bg-gray-50 flex flex-col">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2">
            <img src="/artspace-logo.png" alt="ArtSpace" className="h-14 object-contain" />
            <span className="font-bold text-gray-900 text-sm">ArtSpace</span>
          </Link>
          <Link to="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">← Back</Link>
        </div>

        <div className="flex-1 flex items-start justify-center py-10 px-6">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your shop</h1>
              <p className="text-sm text-gray-500">Get online in minutes. No tech skills needed.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* ── Section: Your Business ── */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Your Business</p>

                {/* Business Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Name</label>
                  <input name="businessName" value={form.businessName} onChange={handleChange}
                    placeholder="e.g. Glamour Nails" maxLength={30} className={inputClass('businessName')} />
                  <div className="flex items-start justify-between mt-1">
                    {errors.businessName ? <p className="text-xs text-red-500">{errors.businessName}</p> : <span />}
                    <p className="text-xs text-gray-400 flex-shrink-0">{form.businessName.length}/30</p>
                  </div>
                </div>

                {/* Shop URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Shop URL</label>
                  <div className="relative">
                    <input name="slug" value={form.slug} onChange={handleChange}
                      placeholder="glamournails" className={`${inputClass('slug')} pr-10`} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                      <SlugStatus status={slugStatus} />
                    </span>
                  </div>
                  {form.slug && (
                    <p className="mt-1 text-xs text-gray-400 font-mono">
                      {APP_URL}/s/<span className="text-violet-600 font-semibold">{form.slug}</span>
                    </p>
                  )}
                  {slugInfo && <p className={`mt-0.5 text-xs font-medium ${slugInfo.cls}`}>{slugInfo.text}</p>}
                  {errors.slug && <p className="mt-1 text-xs text-red-500">{errors.slug}</p>}
                </div>

                {/* Business Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Type</label>
                  <BusinessTypeSelect
                    value={form.businessType} onChange={handleChange}
                    options={BUSINESS_TYPE_OPTIONS} error={errors.businessType}
                  />
                  {errors.businessType && <p className="mt-1 text-xs text-red-500">{errors.businessType}</p>}
                </div>
              </div>

              {/* ── Section: Your Account ── */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Your Account</p>

                {/* Owner Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Name</label>
                  <input name="ownerName" value={form.ownerName} onChange={handleChange}
                    placeholder="Your full name" className={inputClass('ownerName')} />
                  {errors.ownerName && <p className="mt-1 text-xs text-red-500">{errors.ownerName}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange}
                    placeholder="you@example.com" autoComplete="email" className={inputClass('email')} />
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile Number</label>
                  <div className="flex gap-2">
                    <div className="relative flex-shrink-0">
                      <select name="countryCode" value={form.countryCode} onChange={handleChange}
                        className="appearance-none pl-3 pr-7 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white hover:border-gray-300">
                        {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    </div>
                    <input name="mobile" value={form.mobile} onChange={handleChange}
                      onKeyDown={handleMobileKeyDown} placeholder="9876543210"
                      inputMode="numeric" className={`flex-1 ${inputClass('mobile')}`} />
                  </div>
                  {errors.mobile && <p className="mt-1 text-xs text-red-500">{errors.mobile}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} name="password"
                      value={form.password} onChange={handleChange}
                      placeholder="Min. 8 characters" autoComplete="new-password"
                      className={`${inputClass('password')} pr-10`} />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                </div>
              </div>

              {/* ── Section: Plan ── */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Choose a Plan</p>

                {!pricingLoaded ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
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
                          onClick={() => setForm(p => ({ ...p, plan, customDays: '' }))}
                          className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border text-left transition-all duration-150 ${
                            isSelected
                              ? 'border-violet-500 bg-violet-50/60 ring-2 ring-violet-200'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          {/* Radio dot */}
                          <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                            isSelected ? 'border-violet-600' : 'border-gray-300'
                          }`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-violet-600" />}
                          </div>
                          {/* Label */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">{meta.label}</span>
                              {meta.highlight && (
                                <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-semibold">Recommended</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">{meta.duration} · {meta.desc}</p>
                          </div>
                          {/* Price */}
                          <div className="flex-shrink-0 text-right">
                            {priceLabel(plan)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Custom days input */}
                {form.plan === 'custom' && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-3">
                      <input type="number" min="1" name="customDays" value={form.customDays}
                        onChange={e => setForm(p => ({ ...p, customDays: e.target.value.replace(/[^0-9]/g, '') }))}
                        placeholder="Number of days"
                        className="flex-1 px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 hover:border-gray-300" />
                      <span className="text-sm text-gray-400 whitespace-nowrap">days</span>
                    </div>
                    {form.customDays && parseInt(form.customDays, 10) > 0 && pricing['custom_daily'] && (
                      <div className="bg-violet-50 border border-violet-100 rounded-xl px-4 py-3">
                        <p className="text-sm font-semibold text-violet-700">
                          {form.customDays} days × ₹{pricing['custom_daily']}/day = ₹{parseInt(form.customDays, 10) * pricing['custom_daily']}
                        </p>
                      </div>
                    )}
                    {errors.customDays && <p className="text-xs text-red-500">{errors.customDays}</p>}
                  </div>
                )}

                {form.plan !== 'trial' && (
                  <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-100 px-3 py-2.5 rounded-xl">
                    You'll complete payment via Razorpay after clicking "Create My Shop". Account is created only after payment is confirmed.
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={
                  isLoading ||
                  (form.slug.length >= 3 && slugStatus !== 'available') ||
                  (form.plan === 'custom' && (!form.customDays || parseInt(form.customDays, 10) < 1))
                }
                className="w-full py-3.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold transition-all shadow-sm hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />{form.plan === 'trial' ? 'Creating your shop…' : 'Opening payment…'}</>
                ) : (
                  <>{form.plan === 'trial' ? 'Create My Shop' : 'Continue to Payment'}<ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              <p className="text-center text-xs text-gray-400">
                Already have a shop?{' '}
                <span className="text-gray-500">
                  Log in at{' '}
                  <span className="font-mono text-violet-600">/s/yourshopslug/admin/login</span>
                </span>
              </p>
            </form>

            <p className="text-center text-xs text-gray-400 mt-6 flex items-center justify-center gap-1.5">
              Built by{' '}
              <a href="mailto:er.cs.krushnasoni@gmail.com"
                className="inline-flex items-center gap-1 text-gray-400 hover:text-violet-600 transition-colors font-medium"
              >
                <Mail className="w-3 h-3" />
                Krushna Soni
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}