import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TenantProvider, useTenant } from './context/TenantContext';
import { isSuperAdminPath, getTenantSlug } from './utils/subdomainUtils';

// Pages
import HomePage from './pages/public/HomePage';
import ShopPage from './pages/public/ShopPage';
import UnavailablePage from './pages/public/UnavailablePage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import SuperAdminLoginPage from './pages/superadmin/SuperAdminLoginPage';
import SuperAdminDashboardPage from './pages/superadmin/SuperAdminDashboardPage';

// Placeholder pages for Phase 15 routes
import SuperAdminTenantsPlaceholder from './pages/superadmin/placeholders/SuperAdminTenantsPlaceholder';
import SuperAdminPricingPlaceholder from './pages/superadmin/placeholders/SuperAdminPricingPlaceholder';
import SuperAdminAuditPlaceholder from './pages/superadmin/placeholders/SuperAdminAuditPlaceholder';

// ─── Loading Screen ───────────────────────────────────────────────────────────
const LoadingScreen = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#fafafa',
    fontFamily: 'system-ui, sans-serif',
    color: '#999',
    fontSize: '0.875rem',
  }}>
    Loading…
  </div>
);

// ─── Route Guards ─────────────────────────────────────────────────────────────

/**
 * Protects a route by role.
 * - If loading: show spinner
 * - If not authenticated: redirect to login
 * - If wrong role: redirect to appropriate login
 */
const ProtectedRoute = ({ children, redirectTo, requiredRole }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <LoadingScreen />;

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Role check — if a specific role is required
  if (requiredRole && user?.role !== requiredRole) {
    // Wrong role: send to the correct login for what they tried to access
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

/**
 * Redirects already-authenticated users away from login pages.
 * Role-aware: super admin goes to super admin dashboard, tenant goes to tenant dashboard.
 */
const PublicOnlyRoute = ({ children, redirectTo, requiredRole }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <LoadingScreen />;

  if (isAuthenticated) {
    // If same role as what this route guards, redirect to its dashboard
    if (!requiredRole || user?.role === requiredRole) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  return children;
};

// ─── Super Admin Panel ────────────────────────────────────────────────────────
const SuperAdminPanel = () => (
  <Routes>
    <Route
      path="/superadmin/login"
      element={
        <PublicOnlyRoute redirectTo="/superadmin/dashboard" requiredRole="superadmin">
          <SuperAdminLoginPage />
        </PublicOnlyRoute>
      }
    />
    <Route
      path="/superadmin/dashboard"
      element={
        <ProtectedRoute redirectTo="/superadmin/login" requiredRole="superadmin">
          <SuperAdminDashboardPage />
        </ProtectedRoute>
      }
    />
    {/* Phase 15 placeholder routes */}
    <Route
      path="/superadmin/tenants"
      element={
        <ProtectedRoute redirectTo="/superadmin/login" requiredRole="superadmin">
          <SuperAdminTenantsPlaceholder />
        </ProtectedRoute>
      }
    />
    <Route
      path="/superadmin/pricing"
      element={
        <ProtectedRoute redirectTo="/superadmin/login" requiredRole="superadmin">
          <SuperAdminPricingPlaceholder />
        </ProtectedRoute>
      }
    />
    <Route
      path="/superadmin/audit"
      element={
        <ProtectedRoute redirectTo="/superadmin/login" requiredRole="superadmin">
          <SuperAdminAuditPlaceholder />
        </ProtectedRoute>
      }
    />
    <Route path="/superadmin" element={<Navigate to="/superadmin/login" replace />} />
    <Route path="*" element={<Navigate to="/superadmin/login" replace />} />
  </Routes>
);

// ─── Tenant Admin Panel ───────────────────────────────────────────────────────
const TenantAdminPanel = () => (
  <Routes>
    <Route
      path="login"
      element={
        <PublicOnlyRoute redirectTo="dashboard" requiredRole="tenant_admin">
          <AdminLoginPage />
        </PublicOnlyRoute>
      }
    />
    <Route
      path="dashboard"
      element={
        <ProtectedRoute redirectTo="login" requiredRole="tenant_admin">
          <AdminDashboardPage />
        </ProtectedRoute>
      }
    />
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="*" element={<Navigate to="login" replace />} />
  </Routes>
);

// ─── Tenant Public Site ───────────────────────────────────────────────────────
const TenantPublicSite = () => {
  const { tenant, isLoading } = useTenant();

  if (isLoading) return <LoadingScreen />;
  if (tenant?.unavailable) return <UnavailablePage />;

  return (
    <Routes>
      <Route index element={<HomePage />} />
      <Route path="shop" element={<ShopPage />} />
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
};

// ─── Root Router ──────────────────────────────────────────────────────────────
const AppRouter = () => {
  const isSuperAdmin = isSuperAdminPath();
  const tenantSlug = getTenantSlug();

  if (isSuperAdmin) {
    return <SuperAdminPanel />;
  }

  if (tenantSlug) {
    return (
      <TenantProvider>
        <Routes>
          <Route path="/s/:slug/admin/*" element={<TenantAdminPanel />} />
          <Route path="/s/:slug/*" element={<TenantPublicSite />} />
        </Routes>
      </TenantProvider>
    );
  }

  // Platform landing page — Phase 17
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      color: '#666',
    }}>
      <p>ArtSpace — Coming Soon</p>
    </div>
  );
};

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '8px',
              fontSize: '0.875rem',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}