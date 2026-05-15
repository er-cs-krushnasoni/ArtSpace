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
const ProtectedRoute = ({ children, redirectTo }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  return isAuthenticated ? children : <Navigate to={redirectTo} replace />;
};

const PublicOnlyRoute = ({ children, redirectTo }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  return !isAuthenticated ? children : <Navigate to={redirectTo} replace />;
};

// ─── Super Admin Panel ────────────────────────────────────────────────────────
const SuperAdminPanel = () => (
  <Routes>
    <Route
      path="/superadmin/login"
      element={
        <PublicOnlyRoute redirectTo="/superadmin/dashboard">
          <SuperAdminLoginPage />
        </PublicOnlyRoute>
      }
    />
    <Route
      path="/superadmin/dashboard"
      element={
        <ProtectedRoute redirectTo="/superadmin/login">
          <SuperAdminDashboardPage />
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
        <PublicOnlyRoute redirectTo="dashboard">
          <AdminLoginPage />
        </PublicOnlyRoute>
      }
    />
    <Route
      path="dashboard"
      element={
        <ProtectedRoute redirectTo="login">
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