import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TenantProvider, useTenant } from './context/TenantContext';
import { isSuperAdminPath, getTenantSlug } from './utils/subdomainUtils';
import ErrorBoundary from './components/common/ErrorBoundary';

import PlatformLandingPage   from './pages/public/PlatformLandingPage';
import SignupPage             from './pages/tenant/SignupPage';
import HomePage               from './pages/public/HomePage';
import ShopPage               from './pages/public/ShopPage';
import CustomOrderPage        from './pages/public/CustomOrderPage';
import AppointmentPage        from './pages/public/AppointmentPage';
import UnavailablePage        from './pages/public/UnavailablePage';
import TenantLoginPage        from './pages/admin/TenantLoginPage';
import ForgotPasswordPage     from './pages/admin/ForgotPasswordPage';
import ResetPasswordPage      from './pages/admin/ResetPasswordPage';
import AdminDashboardPage     from './pages/admin/AdminDashboardPage';
import SuperAdminLoginPage    from './pages/superadmin/SuperAdminLoginPage';
import SuperAdminDashboardPage from './pages/superadmin/SuperAdminDashboardPage';
import SuperAdminTenantsPage  from './pages/superadmin/SuperAdminTenantsPage';
import SuperAdminPricingPage  from './pages/superadmin/SuperAdminPricingPage';
import SuperAdminAuditPage    from './pages/superadmin/SuperAdminAuditPage';
import QuizPage               from './pages/public/QuizPage';
import BlogIndexPage          from './pages/public/BlogIndexPage';
import BlogPostPage           from './pages/public/BlogPostPage';
import NotFoundPage           from './pages/NotFoundPage';

// ─── Loading Screen ───────────────────────────────────────────────────────────
const LoadingScreen = () => (
  <div style={{
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#fafafa', fontFamily: 'system-ui, sans-serif', color: '#999', fontSize: '0.875rem',
  }}>
    Loading…
  </div>
);

// ─── Route Guards ─────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children, redirectTo, requiredRole }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to={redirectTo} replace />;
  if (requiredRole && user?.role !== requiredRole) return <Navigate to={redirectTo} replace />;
  return children;
};

const ProtectedTenantRoute = ({ children, slug }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated || user?.role !== 'tenant_admin')
    return <Navigate to={`/s/${slug}/admin/login`} replace />;
  if (user?.slug !== slug)
    return <Navigate to={`/s/${slug}/admin/login`} replace />;
  return children;
};

const PublicOnlyRoute = ({ children, redirectTo, requiredRole }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (isAuthenticated && (!requiredRole || user?.role === requiredRole))
    return <Navigate to={redirectTo} replace />;
  return children;
};

// ─── Super Admin Panel ────────────────────────────────────────────────────────
const SuperAdminPanel = () => (
  <Routes>
    <Route path="/superadmin/login"
      element={<PublicOnlyRoute redirectTo="/superadmin/dashboard" requiredRole="superadmin"><SuperAdminLoginPage /></PublicOnlyRoute>}
    />
    <Route path="/superadmin/dashboard" element={<ProtectedRoute redirectTo="/superadmin/login" requiredRole="superadmin"><SuperAdminDashboardPage /></ProtectedRoute>} />
    <Route path="/superadmin/tenants"   element={<ProtectedRoute redirectTo="/superadmin/login" requiredRole="superadmin"><SuperAdminTenantsPage /></ProtectedRoute>} />
    <Route path="/superadmin/pricing"   element={<ProtectedRoute redirectTo="/superadmin/login" requiredRole="superadmin"><SuperAdminPricingPage /></ProtectedRoute>} />
    <Route path="/superadmin/audit"     element={<ProtectedRoute redirectTo="/superadmin/login" requiredRole="superadmin"><SuperAdminAuditPage /></ProtectedRoute>} />
    <Route path="/superadmin"           element={<Navigate to="/superadmin/login" replace />} />
    <Route path="*"                     element={<Navigate to="/superadmin/login" replace />} />
  </Routes>
);

// ─── Tenant Admin Panel ───────────────────────────────────────────────────────
const TenantAdminPanel = ({ slug }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <LoadingScreen />;
  return (
    <Routes>
      <Route path="login"
        element={
          isAuthenticated && user?.role === 'tenant_admin' && user?.slug === slug
            ? <Navigate to={`/s/${slug}/admin/dashboard`} replace />
            : <TenantLoginPage />
        }
      />
      <Route path="forgot-password" element={<ForgotPasswordPage />} />
      <Route path="reset-password"  element={<ResetPasswordPage />} />
      <Route path="dashboard/*"
        element={
          <ProtectedTenantRoute slug={slug}>
            <AdminDashboardPage />
          </ProtectedTenantRoute>
        }
      />
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="*" element={<Navigate to={`/s/${slug}/admin/login`} replace />} />
    </Routes>
  );
};

// ─── Tenant Public Site ───────────────────────────────────────────────────────
const TenantPublicSite = () => {
  const { isLoading, isUnavailable } = useTenant();
  if (isLoading)     return <LoadingScreen />;
  if (isUnavailable) return <UnavailablePage />;
  return (
    <Routes>
      <Route index element={<HomePage />} />
      <Route path="shop"           element={<ShopPage />} />
      <Route path="custom-order"   element={<CustomOrderPage />} />
      <Route path="appointment"    element={<AppointmentPage />} />
      <Route path="quiz"           element={<QuizPage />} />
      <Route path="blog"           element={<BlogIndexPage />} />
      <Route path="blog/:postSlug" element={<BlogPostPage />} />
      <Route path="*"              element={<Navigate to="" replace />} />
    </Routes>
  );
};

// ─── Root Router ──────────────────────────────────────────────────────────────
const AppRouter = () => {
  const isSuperAdmin = isSuperAdminPath();
  const tenantSlug   = getTenantSlug();

  if (isSuperAdmin) return <SuperAdminPanel />;

  if (tenantSlug) {
    return (
      <TenantProvider>
        <Routes>
          <Route path="/s/:slug/admin/*" element={<TenantAdminPanel slug={tenantSlug} />} />
          <Route path="/s/:slug/*"       element={<TenantPublicSite />} />
        </Routes>
      </TenantProvider>
    );
  }

  return (
    <Routes>
      <Route path="/"       element={<PlatformLandingPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="*"       element={<NotFoundPage />} />
    </Routes>
  );
};

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { borderRadius: '8px', fontSize: '0.875rem' },
              error: { duration: 4000 },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}