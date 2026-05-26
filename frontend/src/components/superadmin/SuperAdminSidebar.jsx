import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  ScrollText,
  LogOut,
  Mail
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';
import { tokenStore } from '../../api/tokenStore';

const navItems = [
  { label: 'Dashboard',      icon: LayoutDashboard, to: '/superadmin/dashboard' },
  { label: 'Tenants',        icon: Building2,       to: '/superadmin/tenants' },
  { label: 'Plans & Pricing', icon: CreditCard,     to: '/superadmin/pricing' },
  { label: 'Audit Log',      icon: ScrollText,      to: '/superadmin/audit' },
];

export default function SuperAdminSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/superadmin/auth/logout');
    } catch {
      // Clear client state regardless
    } finally {
      tokenStore.clear();
      logout();
      navigate('/superadmin/login', { replace: true });
    }
  };

  return (
    <aside
      className="fixed top-0 left-0 h-screen w-60 flex flex-col z-40"
      style={{ backgroundColor: '#0f1117' }}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
            <img src="/artspace-logo.png" alt="ArtSpace" className="w-8 h-8 object-contain rounded-lg" />
          </div>
          <div>
            <p
              className="text-white font-semibold text-sm leading-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              ArtSpace
            </p>
            <p
              className="text-[11px] leading-tight"
              style={{ color: '#8b8fa8', fontFamily: "'Inter', sans-serif" }}
            >
              Super Admin
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                isActive ? 'text-[#c4b5fd]' : 'hover:bg-white/5'
              }`
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? 'rgba(139,92,246,0.18)' : undefined,
              color: isActive ? '#c4b5fd' : '#8b8fa8',
              fontFamily: "'Inter', sans-serif",
            })}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: user + logout */}
      <div className="px-3 py-4 border-t border-white/5">
        <div className="px-3 mb-3">
          <p
            className="text-[11px] truncate"
            style={{ color: '#8b8fa8', fontFamily: "'Inter', sans-serif" }}
          >
            {user?.email || 'Super Admin'}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all duration-200 hover:bg-white/5"
          style={{ color: '#8b8fa8', fontFamily: "'Inter', sans-serif" }}
        >
          <LogOut size={16} />
          Sign out
        </button>
        <a href="mailto:er.cs.krushnasoni@gmail.com"
  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs w-full transition-all duration-200 hover:bg-white/5 mt-1"
  style={{ color: 'var(--color-sidebar-text)' }}
  title="Contact developer"
></a>
      </div>
    </aside>
  );
}