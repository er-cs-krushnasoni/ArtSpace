import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, CreditCard, Settings, LogOut, Menu, X,
  Package, Tag, Inbox, CalendarCheck, HelpCircle, BookOpen,
  BarChart2, Download, AlertTriangle, Mail,
} from 'lucide-react';
import api from '../../api/axiosInstance';
import { useAuth }   from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import toast from 'react-hot-toast';
import SubscriptionPage    from './SubscriptionPage';
import ExpiredPage         from './ExpiredPage';
import PausedPage          from './PausedPage';
import WebsiteSettingsPage from './WebsiteSettingsPage';
import ProductsPage        from './ProductsPage';
import CategoriesPage      from './CategoriesPage';
import InboxPage           from './InboxPage';
import TodoCalendarPage    from './TodoCalendarPage';
import QuizBuilderPage     from './QuizBuilderPage';
import BlogManagerPage     from './BlogManagerPage';
import AnalyticsPage       from './AnalyticsPage';
import PostEditorPage      from './PostEditorPage';

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const AdminSidebar = ({ slug, businessName, onLogout, mobileOpen, onClose, unreadCount, canInstall, onInstall }) => {
  const NAV_ITEMS = [
    { label: 'Dashboard',        icon: LayoutDashboard, to: `/s/${slug}/admin/dashboard/home` },
    { label: 'Inbox',            icon: Inbox,           to: `/s/${slug}/admin/dashboard/inbox`,      badge: unreadCount },
    { label: 'Tasks',            icon: CalendarCheck,   to: `/s/${slug}/admin/dashboard/calendar` },
    { label: 'Analytics',        icon: BarChart2,       to: `/s/${slug}/admin/dashboard/analytics` },
    { label: 'Products',         icon: Package,         to: `/s/${slug}/admin/dashboard/products` },
    { label: 'Categories',       icon: Tag,             to: `/s/${slug}/admin/dashboard/categories` },
    { label: 'Style Quiz',       icon: HelpCircle,      to: `/s/${slug}/admin/dashboard/quiz` },
    { label: 'Blog',             icon: BookOpen,        to: `/s/${slug}/admin/dashboard/blog` },
    { label: 'Subscription',     icon: CreditCard,      to: `/s/${slug}/admin/dashboard/subscription` },
    { label: 'Website Settings', icon: Settings,        to: `/s/${slug}/admin/dashboard/settings` },
  ];

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={onClose} />
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
        {/* Shop name header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/5">
          <div>
            <p className="text-white font-semibold text-sm leading-tight truncate max-w-[160px]">
              {businessName || 'My Shop'}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-sidebar-text)' }}>
              Admin Panel
            </p>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-white" aria-label="Close menu">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ label, icon: Icon, to, badge }) => (
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
              <span className="flex-1">{label}</span>
              {badge > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-semibold text-white bg-violet-500">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 py-4 border-t border-white/5 space-y-1">
          {canInstall && (
            <button
              onClick={onInstall}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium w-full transition-all duration-200 hover:bg-white/5"
              style={{ color: 'var(--color-sidebar-active-text)' }}
            >
              <Download className="w-4 h-4" />
              Install App
            </button>
          )}
          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium w-full transition-all duration-200 hover:bg-white/5"
            style={{ color: 'var(--color-sidebar-text)' }}
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
          <a
            href="mailto:er.cs.krushnasoni@gmail.com"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs w-full transition-all duration-200 hover:bg-white/5 mt-1"
            style={{ color: 'var(--color-sidebar-text)' }}
            title="Contact developer"
          >
            <Mail className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">Developed by Krushna Soni</span>
          </a>
        </div>
      </aside>
    </>
  );
};

// ─── Dashboard Home ───────────────────────────────────────────────────────────
const DashboardHome = ({ unreadCount, unreadLoading, taskSummary, taskLoading }) => {
  const { tenant } = useTenant();
  const { slug }   = useParams();
  const navigate   = useNavigate();

  useEffect(() => {
    if (tenant?.businessName) {
      document.title = `Dashboard — ${tenant.businessName} Admin`;
    }
  }, [tenant]);

  const showSetupBanner = tenant && !tenant.websiteConfig?.logo;

  return (
    <div className="p-6">
      {showSetupBanner && (
        <div className="mb-5 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-900">Complete your shop setup</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Upload a logo and fill in your shop details to give customers a great first impression.
            </p>
          </div>
          <button
            onClick={() => navigate(`/s/${slug}/admin/dashboard/settings`)}
            className="flex-shrink-0 px-3 py-1.5 text-xs font-semibold text-white rounded-lg bg-amber-500 hover:bg-amber-600 transition-colors"
          >
            Complete Setup
          </button>
        </div>
      )}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Welcome back.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="bg-gray-50 rounded-xl p-4 cursor-pointer hover:bg-violet-50 transition-colors"
          onClick={() => navigate(`/s/${slug}/admin/dashboard/inbox`)}
        >
          <p className="text-xs text-gray-500 mb-1">Unread Queries</p>
          {unreadLoading
            ? <div className="h-8 w-12 bg-gray-200 rounded animate-pulse" />
            : <p className="text-2xl font-semibold text-gray-900">{unreadCount}</p>}
        </div>
        <div
          className="bg-gray-50 rounded-xl p-4 cursor-pointer hover:bg-violet-50 transition-colors"
          onClick={() => navigate(`/s/${slug}/admin/dashboard/calendar`)}
        >
          <p className="text-xs text-gray-500 mb-1">Today's Appointments</p>
          {taskLoading
            ? <div className="h-8 w-12 bg-gray-200 rounded animate-pulse" />
            : <p className="text-2xl font-semibold text-gray-900">{taskSummary.todayAppointments ?? 0}</p>}
        </div>
        <div
          className="bg-gray-50 rounded-xl p-4 cursor-pointer hover:bg-violet-50 transition-colors"
          onClick={() => navigate(`/s/${slug}/admin/dashboard/calendar`)}
        >
          <p className="text-xs text-gray-500 mb-1">Today's Deliveries</p>
          {taskLoading
            ? <div className="h-8 w-12 bg-gray-200 rounded animate-pulse" />
            : <p className="text-2xl font-semibold text-gray-900">{taskSummary.todayDeliveries ?? 0}</p>}
        </div>
      </div>
    </div>
  );
};

// ─── Blocked screen helper ────────────────────────────────────────────────────
const BlockedScreen = ({ icon: Icon, iconBg, iconColor, title, message, action }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-8 max-w-md w-full text-center">
      <div className={`w-14 h-14 ${iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
        <Icon className={`w-7 h-7 ${iconColor}`} />
      </div>
      <h1 className="text-xl font-semibold text-gray-900 mb-2">{title}</h1>
      <p className="text-sm text-gray-500 mb-6">{message}</p>
      {action}
    </div>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const { slug }         = useParams();
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const { canInstall, install } = usePWAInstall();

  const [accountStatus, setAccountStatus] = useState(null);
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [unreadLoading, setUnreadLoading] = useState(true);
  const [taskSummary,   setTaskSummary]   = useState({});
  const [taskLoading,   setTaskLoading]   = useState(true);

  useEffect(() => {
    if (user && user.slug !== slug)
      navigate(`/s/${slug}/admin/login`, { replace: true });
  }, [user, slug, navigate]);

  useEffect(() => {
    const linkId   = 'tenant-pwa-manifest';
    const existing = document.getElementById(linkId);
    if (existing) existing.remove();
    const link  = document.createElement('link');
    link.rel    = 'manifest';
    link.href   = `/api/public/${slug}/pwa-manifest.json`;
    link.id     = linkId;
    document.head.appendChild(link);
    return () => { document.getElementById(linkId)?.remove(); };
  }, [slug]);

  useEffect(() => { checkStatus(); }, []);

  // ── Fix #8: dedicated unread-count endpoint ───────────────────────────────
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await api.get('/tenant/inbox/unread-count');
      setUnreadCount(res.data.count ?? 0);
    } catch { /* non-critical */ }
    finally   { setUnreadLoading(false); }
  }, []);

  const fetchTaskSummary = useCallback(async () => {
    try {
      const res = await api.get('/tenant/tasks');
      setTaskSummary(res.data.summary || {});
    } catch { /* non-critical */ }
    finally   { setTaskLoading(false); }
  }, []);

  useEffect(() => {
    if (accountStatus === 'ok') {
      fetchUnreadCount();
      fetchTaskSummary();
      // ── Fix #11: skip polling when tab is hidden ──────────────────────────
      const interval = setInterval(() => {
        if (!document.hidden) fetchUnreadCount();
      }, 30_000);
      return () => clearInterval(interval);
    }
  }, [accountStatus, fetchUnreadCount, fetchTaskSummary]);

  // ── Fix #7: retry on network error, handle pending_manual ─────────────────
  const checkStatus = async (retryCount = 0) => {
    try {
      const res = await api.get('/subscription/status');
      const s   = res.data?.status;
      if      (s === 'expired')        setAccountStatus('expired');
      else if (s === 'paused')         setAccountStatus('paused');
      else if (s === 'pending_manual') setAccountStatus('pending_manual');
      else if (s === 'inactive')       setAccountStatus('unauthenticated');
      else                             setAccountStatus('ok');
    } catch (err) {
      const code       = err?.response?.data?.code;
      const httpStatus = err?.response?.status;
      if      (code === 'SUBSCRIPTION_EXPIRED') setAccountStatus('expired');
      else if (code === 'ACCOUNT_PAUSED')       setAccountStatus('paused');
      else if (code === 'PENDING_MANUAL')       setAccountStatus('pending_manual');
      else if (httpStatus === 401)              setAccountStatus('unauthenticated');
      else if (httpStatus >= 400)               setAccountStatus('ok');
      else {
        // Network error — retry up to 3 times before showing error screen
        if (retryCount < 3) {
          setTimeout(() => checkStatus(retryCount + 1), 2000);
        } else {
          setAccountStatus('network_error');
        }
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate(`/s/${slug}/admin/login`, { replace: true });
    toast.success('Signed out successfully');
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (accountStatus === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-sm text-gray-400">Loading…</div>
      </div>
    );
  }

  // ── Unauthenticated ───────────────────────────────────────────────────────
  if (accountStatus === 'unauthenticated') {
    navigate(`/s/${slug}/admin/login`, { replace: true });
    return null;
  }

  // ── Subscription expired ──────────────────────────────────────────────────
  if (accountStatus === 'expired') return <ExpiredPage slug={slug} />;

  // ── Account paused ────────────────────────────────────────────────────────
  if (accountStatus === 'paused')  return <PausedPage  slug={slug} />;

  // ── Fix #7: pending_manual screen ─────────────────────────────────────────
  if (accountStatus === 'pending_manual') {
    return (
      <BlockedScreen
        icon={AlertTriangle}
        iconBg="bg-amber-50"
        iconColor="text-amber-400"
        title="Account Pending Activation"
        message="Your account is awaiting manual activation. Please contact support to get started."
        action={
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Sign out
          </button>
        }
      />
    );
  }

  // ── Fix #8: network error with retry ──────────────────────────────────────
  if (accountStatus === 'network_error') {
    return (
      <BlockedScreen
        icon={AlertTriangle}
        iconBg="bg-gray-50"
        iconColor="text-gray-400"
        title="Connection Problem"
        message="Unable to reach the server. Please check your connection and try again."
        action={
          <button
            onClick={() => { setAccountStatus(null); checkStatus(); }}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg px-4 py-2.5 transition-all duration-200"
          >
            Retry
          </button>
        }
      />
    );
  }

  // ── Main dashboard ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar
        slug={slug}
        businessName={user?.businessName}
        onLogout={handleLogout}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        unreadCount={unreadCount}
        canInstall={canInstall}
        onInstall={install}
      />
      <div className="lg:ml-60 min-h-screen flex flex-col">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
          <button onClick={() => setMobileOpen(true)} className="text-gray-500 hover:text-gray-700" aria-label="Open menu">
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-gray-900 truncate flex-1">
            {user?.businessName || 'Admin'}
          </span>
          {canInstall && (
            <button
              onClick={install}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-violet-700 border border-violet-200 rounded-lg hover:bg-violet-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Install
            </button>
          )}
        </header>

        <main className="flex-1">
          <Routes>
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home"              element={<DashboardHome unreadCount={unreadCount} unreadLoading={unreadLoading} taskSummary={taskSummary} taskLoading={taskLoading} />} />
            <Route path="inbox"             element={<InboxPage />} />
            <Route path="calendar"          element={<TodoCalendarPage />} />
            <Route path="products"          element={<ProductsPage />} />
            <Route path="categories"        element={<CategoriesPage />} />
            <Route path="quiz"              element={<QuizBuilderPage />} />
            <Route path="blog"              element={<BlogManagerPage />} />
            <Route path="blog/new"          element={<PostEditorPage />} />
            <Route path="blog/edit/:postId" element={<PostEditorPage />} />
            <Route path="analytics"         element={<AnalyticsPage />} />
            <Route path="subscription"      element={<SubscriptionPage />} />
            <Route path="settings"          element={<WebsiteSettingsPage />} />
            <Route path="*"                 element={<Navigate to="home" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}