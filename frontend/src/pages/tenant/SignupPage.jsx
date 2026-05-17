import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Check, X, Loader2, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { tokenStore } from '../../api/tokenStore';

const BUSINESS_TYPES = [
  { value: 'nail_art', label: 'Nail Art' },
  { value: 'mehendi', label: 'Mehendi' },
  { value: 'jewellery', label: 'Jewellery' },
  { value: 'cake_shop', label: 'Cake Shop' },
  { value: 'generic', label: 'Generic / Other' },
];

const COUNTRY_CODES = [
  { code: '+91', label: '🇮🇳 +91' },
  { code: '+1', label: '🇺🇸 +1' },
  { code: '+44', label: '🇬🇧 +44' },
  { code: '+971', label: '🇦🇪 +971' },
  { code: '+65', label: '🇸🇬 +65' },
  { code: '+61', label: '🇦🇺 +61' },
];

const PLANS = [
  { value: 'trial', label: 'Free Trial', duration: '7 days', price: 'Free', highlight: true },
  { value: '1m', label: '1 Month', duration: '30 days', price: 'Paid' },
  { value: '3m', label: '3 Months', duration: '90 days', price: 'Paid' },
  { value: '6m', label: '6 Months', duration: '180 days', price: 'Paid' },
  { value: '12m', label: '12 Months', duration: '365 days', price: 'Paid' },
  { value: 'custom', label: 'Custom Days', duration: 'You choose', price: 'Custom' },
];

// Slug availability indicator
const SlugStatus = ({ status }) => {
  if (status === 'checking') return <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />;
  if (status === 'available') return <Check className="w-4 h-4 text-green-500" />;
  if (status === 'taken') return <X className="w-4 h-4 text-red-500" />;
  if (status === 'reserved') return <X className="w-4 h-4 text-red-500" />;
  if (status === 'invalid') return <X className="w-4 h-4 text-red-500" />;
  return null;
};

const slugStatusText = (status) => {
  if (status === 'available') return { text: 'Available', cls: 'text-green-600' };
  if (status === 'taken') return { text: 'Already taken', cls: 'text-red-500' };
  if (status === 'reserved') return { text: 'Reserved — choose another', cls: 'text-red-500' };
  if (status === 'invalid') return { text: 'Only lowercase letters, numbers, hyphens (3–30 chars)', cls: 'text-red-500' };
  return null;
};

export default function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    businessName: '',
    slug: '',
    businessType: '',
    ownerName: '',
    email: '',
    countryCode: '+91',
    mobile: '',
    password: '',
    plan: 'trial',
    customDays: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [slugStatus, setSlugStatus] = useState(null); // null | 'checking' | 'available' | 'taken' | 'reserved' | 'invalid'
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [pricing, setPricing] = useState({});
  const debounceRef = useRef(null);

  // Real-time slug check
  const checkSlug = useCallback(async (value) => {
    if (!value || value.length < 3) { setSlugStatus(null); return; }
    if (!/^[a-z0-9-]+$/.test(value) || value.length > 30) { setSlugStatus('invalid'); return; }
    setSlugStatus('checking');
    try {
      const res = await api.get(`/tenantauth/check-slug?slug=${encodeURIComponent(value)}`);
      if (res.data.available) {
        setSlugStatus('available');
      } else {
        setSlugStatus(res.data.reason || 'taken');
      }
    } catch {
      setSlugStatus(null);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Auto-sanitize slug input
    let sanitized = value;
    if (name === 'slug') {
      sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    }

    setForm((prev) => ({ ...prev, [name]: sanitized }));

    // Clear field error on change
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });

    // Debounce slug check
    if (name === 'slug') {
      setSlugStatus(null);
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => checkSlug(sanitized), 500);
    }
  };

  useEffect(() => {
  api.get('/subscription/pricing')
    .then((res) => setPricing(res.data.pricing || {}))
    .catch(() => {});
}, []);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const validate = () => {
    const e = {};
    if (!form.businessName.trim() || form.businessName.trim().length < 2) e.businessName = 'Business name must be at least 2 characters.';
    if (!form.slug || form.slug.length < 3) e.slug = 'Shop URL must be at least 3 characters.';
    if (slugStatus !== 'available') e.slug = 'Please choose a valid, available shop URL.';
    if (!form.businessType) e.businessType = 'Please select a business type.';
    if (!form.ownerName.trim() || form.ownerName.trim().length < 2) e.ownerName = 'Your name must be at least 2 characters.';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Please enter a valid email.';
    if (!form.mobile || !/^\d{10,15}$/.test(form.mobile)) e.mobile = 'Mobile must be 10–15 digits.';
    if (!form.password || form.password.length < 8) e.password = 'Password must be at least 8 characters.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/tenantauth/signup', {
        businessName: form.businessName.trim(),
        slug: form.slug,
        businessType: form.businessType,
        ownerName: form.ownerName.trim(),
        email: form.email,
        mobile: form.mobile,
        password: form.password,
        plan: form.plan,
        ...(form.plan === 'custom' && { customDays: parseInt(form.customDays, 10) }),
      });

      const { accessToken, user } = res.data;
      tokenStore.set(accessToken);
      login(accessToken, user);
      toast.success('Your shop is live! 🎉');
      navigate(`/s/${user.slug}/admin/dashboard`, { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Signup failed. Please try again.';
      // Map backend messages to field errors where possible
      if (msg.toLowerCase().includes('slug') || msg.toLowerCase().includes('url')) {
        setErrors({ slug: msg });
      } else if (msg.toLowerCase().includes('email')) {
        setErrors({ email: msg });
      } else if (msg.toLowerCase().includes('mobile')) {
        setErrors({ mobile: msg });
      } else {
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-3.5 py-2.5 rounded-lg border text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all ${
      errors[field] ? 'border-red-300 bg-red-50' : 'border-gray-200'
    }`;

  const slugInfo = slugStatusText(slugStatus);
  
  const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:5173';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-semibold text-gray-900">ArtSpace</span>
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">Create your shop</h1>
          <p className="text-sm text-gray-500 mt-1">Get online in minutes. No tech skills needed.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">

          {/* Business Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Name</label>
            <input name="businessName" value={form.businessName} onChange={handleChange}
              placeholder="e.g. Glamour Nails" className={inputClass('businessName')} />
            {errors.businessName && <p className="mt-1 text-xs text-red-500">{errors.businessName}</p>}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Shop URL</label>
            <div className="relative">
              <input name="slug" value={form.slug} onChange={handleChange}
                placeholder="glamournails"
                className={`${inputClass('slug')} pr-10`} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                <SlugStatus status={slugStatus} />
              </span>
            </div>
            {/* Preview */}
            {form.slug && (
              <p className="mt-1 text-xs text-gray-400 font-mono">
{APP_URL}/s/<span className="text-gray-600">{form.slug || '…'}</span>
              </p>
            )}
            {slugInfo && (
              <p className={`mt-0.5 text-xs font-medium ${slugInfo.cls}`}>{slugInfo.text}</p>
            )}
            {errors.slug && <p className="mt-1 text-xs text-red-500">{errors.slug}</p>}
          </div>

          {/* Business Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Type</label>
            <div className="relative">
              <select
                name="businessType"
                value={form.businessType}
                onChange={handleChange}
                className={`${inputClass('businessType')} appearance-none pr-8`}
              >
                <option value="">Select type…</option>
                {BUSINESS_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            {errors.businessType && <p className="mt-1 text-xs text-red-500">{errors.businessType}</p>}
          </div>

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
              <div className="relative">
                <select
                  name="countryCode"
                  value={form.countryCode}
                  onChange={handleChange}
                  className="appearance-none pl-3 pr-7 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all bg-white"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
              <input
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                placeholder="9876543210"
                inputMode="numeric"
                className={`flex-1 ${inputClass('mobile')}`}
              />
            </div>
            {errors.mobile && <p className="mt-1 text-xs text-red-500">{errors.mobile}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                className={`${inputClass('password')} pr-10`}
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
          </div>

          {/* Plan Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Plan</label>
            <div className="grid grid-cols-1 gap-2">
              {PLANS.map((plan) => (
                <button
                  key={plan.value}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, plan: plan.value }))}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg border text-left transition-all ${
                    form.plan === plan.value
                      ? 'border-violet-500 bg-violet-50 ring-1 ring-violet-500'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      form.plan === plan.value ? 'border-violet-600' : 'border-gray-300'
                    }`}>
                      {form.plan === plan.value && (
                        <div className="w-2 h-2 rounded-full bg-violet-600" />
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-900">{plan.label}</span>
                      <span className="text-xs text-gray-400 ml-2">· {plan.duration}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {plan.highlight && (
                      <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">
                        Recommended
                      </span>
                    )}
                    <span className={`text-sm font-semibold ${
                      plan.price === 'Free' ? 'text-green-600' :
                      plan.price === 'Custom' ? 'text-violet-600' : 'text-gray-800'
                    }`}>
                      {plan.price === 'Free'
                        ? 'Free'
                        : plan.price === 'Custom'
                        ? `₹${pricing['custom_daily'] ?? '—'}/day`
                        : pricing[plan.value]
                        ? `₹${pricing[plan.value]}`
                        : '—'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            {form.plan === 'custom' && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    name="customDays"
                    value={form.customDays}
                    onChange={(e) => setForm((p) => ({ ...p, customDays: e.target.value.replace(/[^0-9]/g, '') }))}
                    placeholder="Enter number of days"
                    className="flex-1 px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <span className="text-sm text-gray-400 whitespace-nowrap">days</span>
                </div>
                {form.customDays && parseInt(form.customDays, 10) > 0 && pricing['custom_daily'] && (
                  <p className="text-xs text-violet-600 font-medium bg-violet-50 px-3 py-2 rounded-lg">
                    {form.customDays} days × ₹{pricing['custom_daily']}/day = ₹{parseInt(form.customDays, 10) * pricing['custom_daily']}
                  </p>
                )}
              </div>
            )}
            {form.plan !== 'trial' && (
              <p className="mt-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                You'll complete payment via Razorpay after clicking "Create My Shop".
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
            className="w-full py-3 px-4 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors mt-2"
          >
            {isLoading ? 'Creating your shop…' : 'Create My Shop →'}
          </button>

          <p className="text-center text-xs text-gray-400 pt-1">
            Already have a shop?{' '}
<span className="text-gray-500">Log in via your shop's admin URL (e.g. {APP_URL}/s/yourshop/admin/login)</span>
          </p>
        </form>
      </div>
    </div>
  );
}