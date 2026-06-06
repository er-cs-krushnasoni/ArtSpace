import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, CreditCard, ScrollText,
  LogOut, Menu, X, Settings,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';
import { tokenStore } from '../../api/tokenStore';
import SuperAdminSettingsModal from './SuperAdminSettingsModal';

const navItems = [
  { label: 'Dashboard',      icon: LayoutDashboard, to: '/superadmin/dashboard' },
  { label: 'Tenants',        icon: Building2,       to: '/superadmin/tenants' },
  { label: 'Plans & Pricing', icon: CreditCard,     to: '/superadmin/pricing' },
  { label: 'Audit Log',      icon: ScrollText,      to: '/superadmin/audit' },
];

const SidebarContent = ({ onClose, onOpenSettings }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await api.post('/superadmin/auth/logout'); } catch {}
    finally {
      tokenStore.clear();
      logout();
      navigate('/superadmin/login', { replace: true });
    }
  };

  return (
    <aside className="flex flex-col h-full w-60" style={{ backgroundColor: '#0f1117' }}>
      {/* Logo row */}
      <div className="px-5 py-5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src="/artspace-logo.png" alt="ArtSpace" className="w-8 h-8 object-contain rounded-lg flex-shrink-0" />
          <div>
            <p className="text-white font-semibold text-sm leading-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>ArtSpace</p>
            <p className="text-[11px] leading-tight" style={{ color: '#8b8fa8', fontFamily: "'Inter', sans-serif" }}>Super Admin</p>
          </div>
        </div>
        {/* Close button — mobile only */}
        {onClose && (
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-gray-400 lg:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, icon: Icon, to }) => (
          <NavLink key={to} to={to} onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${isActive ? 'text-[#c4b5fd]' : 'hover:bg-white/5'}`
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? 'rgba(139,92,246,0.18)' : undefined,
              color: isActive ? '#c4b5fd' : '#8b8fa8',
              fontFamily: "'Inter', sans-serif",
            })}>
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/5">
        <div className="px-3 mb-2">
          <p className="text-[11px] truncate" style={{ color: '#8b8fa8', fontFamily: "'Inter', sans-serif" }}>
            {user?.email || 'Super Admin'}
          </p>
        </div>
        <button onClick={onOpenSettings}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all duration-200 hover:bg-white/5"
          style={{ color: '#8b8fa8', fontFamily: "'Inter', sans-serif" }}>
          <Settings size={16} />
          My Credentials
        </button>
        <button onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all duration-200 hover:bg-white/5"
          style={{ color: '#8b8fa8', fontFamily: "'Inter', sans-serif" }}>
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
};

export default function SuperAdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      {/* ── Desktop sidebar (always visible ≥ lg) ── */}
      <div className="hidden lg:fixed lg:top-0 lg:left-0 lg:h-screen lg:flex lg:flex-col lg:z-40 w-60">
        <SidebarContent onOpenSettings={() => setSettingsOpen(true)} />
      </div>

      {/* ── Mobile hamburger button ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg shadow-md"
        style={{ backgroundColor: '#0f1117' }}
        aria-label="Open menu"
      >
        <Menu size={20} className="text-gray-300" />
      </button>

      {/* ── Mobile drawer overlay ── */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
          <div className="fixed top-0 left-0 h-full z-50 lg:hidden w-60">
            <SidebarContent
              onClose={() => setMobileOpen(false)}
              onOpenSettings={() => { setMobileOpen(false); setSettingsOpen(true); }}
            />
          </div>
        </>
      )}

      {/* ── Settings modal ── */}
      {settingsOpen && <SuperAdminSettingsModal onClose={() => setSettingsOpen(false)} />}
    </>
  );
}