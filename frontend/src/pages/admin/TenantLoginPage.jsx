// frontend/src/pages/admin/TenantLoginPage.jsx
import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Store } from 'lucide-react';
import toast from 'react-hot-toast';
import useTenantAuth from '../../hooks/useTenantAuth';
import { useTenant } from '../../context/TenantContext';  // ← ADD

export default function TenantLoginPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { tenantLogin } = useTenantAuth();
  const { tenant } = useTenant();  // ← ADD

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please enter your email and password.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const { statusCode } = await tenantLogin(form.email, form.password);
      if (statusCode === 'SUBSCRIPTION_EXPIRED') {
        toast('Your subscription has expired. Please renew.', { icon: '⚠️' });
      } else if (statusCode === 'ACCOUNT_PAUSED') {
        toast('Your account is currently paused.', { icon: '⚠️' });
      }
      navigate(`/s/${slug}/admin/dashboard`, { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ← derive logo and name from tenant config
  const shopLogo = tenant?.websiteConfig?.logo;
  const shopName = tenant?.businessName || 'Your Shop';

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo mark — shop logo if available, else fallback icon */}
        <div className="flex justify-center mb-8">
          {shopLogo ? (
            <img
              src={shopLogo}
              alt={shopName}
              className="w-16 h-16 rounded-xl object-cover shadow-lg"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-sm text-gray-500 mb-6">
            Sign in to {shopName} dashboard
          </p>

          {/* rest of the form unchanged */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                placeholder="you@example.com" autoComplete="email"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <Link to={`/s/${slug}/admin/forgot-password`} className="text-xs text-violet-600 hover:text-violet-700">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} name="password"
                  value={form.password} onChange={handleChange} placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors">
              {isLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-gray-500 mt-6">ArtSpace · Shop Management</p>
      </div>
    </div>
  );
}