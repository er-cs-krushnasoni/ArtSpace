import { useEffect, useState } from 'react';
import { useNavigate, useParams, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { LayoutDashboard, CreditCard, Settings, LogOut, Menu, X, Package, Tag } from 'lucide-react';
import api from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import SubscriptionPage from './SubscriptionPage';
import ExpiredPage from './ExpiredPage';
import PausedPage from './PausedPage';
import WebsiteSettingsPage from './WebsiteSettingsPage';
import ProductsPage from './ProductsPage';
import CategoriesPage from './CategoriesPage';
import toast from 'react-hot-toast';

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const AdminSidebar = ({ slug, businessName, onLogout, mobileOpen, onClose }) => {
  const NAV_ITEMS = [
    { label: 'Dashboard', icon: LayoutDashboard, to: `/s/${slug}/admin/dashboard/home` },
    { label: 'Products', icon: Package, to: `/s/${slug}/admin/dashboard/products` },
    { label: 'Categories', icon: Tag, to: `/s/${slug}/admin/dashboard/categories` },
    { label: 'Subscription', icon: CreditCard, to: `/s/${slug}/admin/dashboard/subscription` },
    { label: 'Website Settings', icon: Settings, to: `/s/${slug}/admin/dashboard/settings` },
  ];

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`
          fixed top-0 left-0 h-full w-60 z-30 flex flex-col
          transition-transform duration-200
          lg:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ background: 'var(--color-sidebar, #0f1117)' }}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/5">
          <div>
            <p className="text-white font-semibold text-sm leading-tight truncate max-w-[160px]">
              {businessName || 'My Shop'}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-sidebar-text, #8b8fa8)' }}>
              Admin Panel
            </p>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ label, icon: Icon, to }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive ? '' : 'hover:bg-white/5'
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? { background: 'var(--color-sidebar-active)', color: 'var(--color-sidebar-active-text)' }
                  : { color: 'var(--color-sidebar-text)' }
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-white/5">
          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium w-full transition-all duration-200 hover:bg-white/5"
            style={{ color: 'var(--color-sidebar-text)' }}
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
};

// ─── Dashboard Home ───────────────────────────────────────────────────────────
const DashboardHome = () => (
  <div className="p-6">
    <div className="mb-6">
      <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
      <p className="text-sm text-gray-500 mt-0.5">Welcome back. More features coming in upcoming phases.</p>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {['Unread Queries', "Today's Appointments", "Today's Deliveries"].map((label) => (
        <div key={label} className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">{label}</p>
          <p className="text-2xl font-semibold text-gray-900">—</p>
        </div>
      ))}
    </div>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const { slug } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [accountStatus, setAccountStatus] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Safety net: if the JWT slug doesn't match the URL slug, redirect to login
  // This handles edge cases where ProtectedTenantRoute hasn't caught it yet
  useEffect(() => {
    if (user && user.slug !== slug) {
      navigate(`/s/${slug}/admin/login`, { replace: true });
    }
  }, [user, slug, navigate]);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const res = await api.get('/subscription/status');
      const tenantStatus = res.data?.status;
      if (tenantStatus === 'expired') setAccountStatus('expired');
      else if (tenantStatus === 'paused') setAccountStatus('paused');
      else setAccountStatus('ok');
    } catch (err) {
      const code = err?.response?.data?.code;
      const httpStatus = err?.response?.status;
      if (code === 'SUBSCRIPTION_EXPIRED') setAccountStatus('expired');
      else if (code === 'ACCOUNT_PAUSED') setAccountStatus('paused');
      else if (httpStatus === 401) setAccountStatus('unauthenticated');
      else setAccountStatus('ok');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate(`/s/${slug}/admin/login`, { replace: true });
    toast.success('Signed out successfully');
  };

  if (accountStatus === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-sm text-gray-400">Loading...</div>
      </div>
    );
  }
  if (accountStatus === 'unauthenticated') {
    navigate(`/s/${slug}/admin/login`, { replace: true });
    return null;
  }
  if (accountStatus === 'expired') return <ExpiredPage slug={slug} />;
  if (accountStatus === 'paused') return <PausedPage slug={slug} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar
        slug={slug}
        businessName={user?.businessName}
        onLogout={handleLogout}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <div className="lg:ml-60 min-h-screen flex flex-col">
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-gray-900 truncate">
            {user?.businessName || 'Admin'}
          </span>
        </header>
        <main className="flex-1">
          <Routes>
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<DashboardHome />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="subscription" element={<SubscriptionPage />} />
            <Route path="settings" element={<WebsiteSettingsPage />} />
            <Route path="*" element={<Navigate to="home" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}