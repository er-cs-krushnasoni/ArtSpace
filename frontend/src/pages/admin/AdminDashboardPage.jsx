import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, CreditCard, Settings, LogOut, Menu, X,
  Package, Tag, Inbox, CalendarCheck, HelpCircle, BookOpen,
  BarChart2, Download, AlertTriangle, Mail, MessageSquare,
  Globe, Copy, Check, ExternalLink, ChevronDown, ChevronUp,
  Smartphone,  ToggleRight,
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
import FAQManagerPage      from './FAQManagerPage';

const PROD_BASE = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─── Trial Warning Banner ─────────────────────────────────────────────────────
const TRIAL_PRODUCT_LIMIT = 10;
const TrialBanner = ({ daysRemaining, slug }) => {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  const isUrgent    = daysRemaining <= 2;
  const accentColor = isUrgent ? '#ef4444' : '#d97706';
  const bgColor     = isUrgent ? '#fef2f2' : '#fffbeb';
  const borderColor = isUrgent ? '#fecaca' : '#fde68a';
  const textColor   = isUrgent ? '#991b1b' : '#92400e';
  const dayLabel =
    daysRemaining === 0
      ? 'Your free trial expires today.'
      : `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} left on your free trial.`;
  return (
    <div
      className="flex items-start gap-3 px-4 py-3 text-sm flex-shrink-0"
      style={{ background: bgColor, borderBottom: `1px solid ${borderColor}` }}
    >
      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: accentColor }} />
      <p className="flex-1 leading-snug min-w-0" style={{ color: textColor }}>
        <span className="font-semibold">{dayLabel} </span>
        Upgrade now to save your shop and unlock more than {TRIAL_PRODUCT_LIMIT} products —
        when your trial ends, everything gets deleted forever. No backup. No recovery.
      </p>
      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        <button
          onClick={() => navigate(`/s/${slug}/admin/dashboard/subscription`)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90 whitespace-nowrap"
          style={{ background: accentColor }}
        >
          Upgrade Now
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded-lg hover:bg-black/5 transition-colors flex-shrink-0"
          style={{ color: accentColor }}
          aria-label="Dismiss trial warning"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// ─── Copy URL hook ────────────────────────────────────────────────────────────
function useCopyUrl(url) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return [copied, copy];
}

// ─── Welcome Modal ────────────────────────────────────────────────────────────
// Shows once per slug on first dashboard visit (localStorage flag).
const WelcomeModal = ({ slug, onClose, onAddProduct }) => {
  const shopUrl  = `${PROD_BASE}/s/${slug}`;
const shareUrl  = `${API_BASE}/public/${slug}/og`;
const [copied, copy] = useCopyUrl(shareUrl);
const handleCopy = () => {
  copy();
  localStorage.setItem(`artspace_shared_${slug}`, '1');
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Top accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 to-violet-700" />

        <div className="p-6">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Emoji + heading */}
          <div className="mb-5">
            <div className="text-3xl mb-3">🎉</div>
            <h2 className="text-xl font-bold text-gray-900 leading-tight">
              Your website is live!
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Share your link with customers and start adding products.
            </p>
          </div>

          {/* URL display */}
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 mb-4">
            <Globe className="w-4 h-4 text-violet-500 flex-shrink-0" />
            <span className="flex-1 text-xs font-mono text-gray-700 truncate">{shopUrl}</span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mb-5">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-700"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            <a
              href={shopUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-700"
            >
              <ExternalLink className="w-4 h-4" />
              View Website
            </a>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium">Next step</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Primary CTA */}
          <button
            onClick={onAddProduct}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white rounded-xl transition-all hover:opacity-90 hover:-translate-y-0.5 shadow-sm"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
          >
            <Package className="w-4 h-4" />
            Add Your First Product
          </button>

          <p className="text-center text-xs text-gray-400 mt-3">
            Products are visible on your website instantly
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── Shop URL Card ────────────────────────────────────────────────────────────
// Always pinned at top of dashboard home.
const ShopUrlCard = ({ slug }) => {
  const shopUrl   = `${PROD_BASE}/s/${slug}`;
  const shareUrl  = `${API_BASE}/public/${slug}/og`;
  const [copied, copy] = useCopyUrl(shareUrl);

  const handleCopy = () => {
    copy();
    localStorage.setItem(`artspace_shared_${slug}`, '1');
  };

  return (
    <div className="mb-5 flex items-center gap-3 p-3.5 bg-violet-50 border border-violet-100 rounded-xl">
      <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
        <Globe className="w-4 h-4 text-violet-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-violet-800 mb-0.5">Your Website</p>
        <p className="text-xs font-mono text-violet-600 truncate">{shopUrl}</p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={handleCopy}
          title="Copy shareable link"
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-violet-700 bg-white border border-violet-200 rounded-lg hover:bg-violet-50 transition-all"
        >
          {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
        <a
          href={shopUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="View website"
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-violet-700 bg-white border border-violet-200 rounded-lg hover:bg-violet-50 transition-all"
        >
          <ExternalLink className="w-3 h-3" />
          View
        </a>
      </div>
    </div>
  );
};

// ─── Service Toggle (inline in checklist) ────────────────────────────────────
const ServiceToggle = ({ checked, onChange, disabled }) => (
  <button
    role="switch"
    aria-checked={checked}
    onClick={() => !disabled && onChange(!checked)}
    disabled={disabled}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/30 disabled:opacity-50 flex-shrink-0 ${
      checked ? 'bg-violet-600' : 'bg-gray-200'
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

// ─── Services Setup Step (expanded inline panel) ──────────────────────────────
const ServicesSetupPanel = ({ slug, tenant, onDone }) => {
  const cfg = tenant?.websiteConfig || {};
  const [services, setServices] = useState({
    productSalesEnabled: cfg.productSalesEnabled !== false,
    deliveryEnabled:     cfg.deliveryEnabled ?? false,
    appointmentEnabled:  cfg.appointmentEnabled ?? true,
    appointmentAtHome:   cfg.appointmentAtHome ?? true,
  });
  const [saving, setSaving] = useState(null);

  const handleToggle = async (key, value) => {
    if (key === 'productSalesEnabled' && !value && !services.appointmentEnabled) {
      toast.error('At least one of Product Sales or Appointment must be enabled');
      return;
    }
    if (key === 'appointmentEnabled' && !value && !services.productSalesEnabled) {
      toast.error('At least one of Product Sales or Appointment must be enabled');
      return;
    }
    const next = { ...services, [key]: value };
    setServices(next);
    setSaving(key);
    try {
      await api.put('/tenant/settings/toggles', { [key]: value });
    } catch (err) {
      setServices(services);
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(null);
    }
  };

  const handleConfirm = () => {
    localStorage.setItem(`artspace_services_set_${slug}`, '1');
    toast.success('Services saved!');
    onDone();
  };

  const rows = [
  {
    key:   'productSalesEnabled',
    label: '🛍️ Product Sales',
    desc:  'You have items ready to sell — like jewellery, cakes, nail kits, or any finished product. Customers can browse and place orders.',
    sub: services.productSalesEnabled ? {
      key:   'deliveryEnabled',
      label: '🚚 Home Delivery',
      desc:  'You can ship or courier products to the customer\'s address. If off, customers can only pick up from your location.',
    } : null,
  },
  {
    key:   'appointmentEnabled',
    label: '📅 Appointment Booking',
    desc:  'Customers can book a time slot with you — for a session, consultation, fitting, or any service that needs scheduling.',
    sub: services.appointmentEnabled ? {
      key:   'appointmentAtHome',
      label: '🏠 You Visit the Customer (Home Service)',
      desc:  'You travel to the customer\'s location to provide the service. If off, customers come to your shop or studio only.',
    } : null,
  },
];

  return (
    <div className="border-t border-gray-50 px-4 py-4 space-y-4 bg-gray-50/50">
      <p className="text-xs text-gray-500 leading-relaxed">
  Tell us how you sell. Turn on what applies to your business — your shop will show only the relevant options to customers. You can change this anytime.
</p>

      {rows.map(({ key, label, desc, sub }) => (
        <div key={key}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-800">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </div>
            <ServiceToggle
              checked={services[key]}
              onChange={(val) => handleToggle(key, val)}
              disabled={saving === key}
            />
          </div>
          {sub && (
            <div className="mt-3 ml-2 pl-3 border-l-2 border-gray-100">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-700">{sub.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{sub.desc}</p>
                </div>
                <ServiceToggle
                  checked={services[sub.key]}
                  onChange={(val) => handleToggle(sub.key, val)}
                  disabled={saving === sub.key}
                />
              </div>
            </div>
          )}
        </div>
      ))}

      <button
        onClick={handleConfirm}
        className="w-full py-2 text-sm font-semibold text-white rounded-lg transition-all hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
      >
        Confirm Services →
      </button>
    </div>
  );
};
// ─── Setup Checklist ──────────────────────────────────────────────────────────
const SetupChecklist = ({ slug, tenant, productCount, canInstall, onInstall }) => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed]           = useState(false);
  const [servicesExpanded, setServicesExpanded] = useState(false);

  const hasLogo        = !!tenant?.websiteConfig?.logo;
  const hasContact     = !!tenant?.websiteConfig?.whatsapp || !!tenant?.websiteConfig?.instagram;
  const hasServicesSet = !!localStorage.getItem(`artspace_services_set_${slug}`);
  const hasShared      = !!localStorage.getItem(`artspace_shared_${slug}`);
  const has1Product    = productCount >= 1;
  const has5Products   = productCount >= 5;

  // Re-render trigger when services confirmed
  const [, forceUpdate] = useState(0);

  const steps = [
    {
      key:    'logo',
      label:  'Upload your logo',
      done:   hasLogo,
      action: () => navigate(`/s/${slug}/admin/dashboard/settings`),
      cta:    'Go to Settings',
      expandable: false,
    },
    {
      key:    'services',
      label:  'Set up your services',
      done:   hasServicesSet,
      action: () => setServicesExpanded(v => !v),
      cta:    servicesExpanded ? 'Collapse' : 'Set Up',
      expandable: true,
    },
    {
      key:    'contact',
      label:  'Add WhatsApp or Instagram',
      done:   hasContact,
      action: () => navigate(`/s/${slug}/admin/dashboard/settings`),
      cta:    'Go to Settings',
      expandable: false,
    },
    {
      key:    'product1',
      label:  'Add your first product',
      done:   has1Product,
      action: () => navigate(`/s/${slug}/admin/dashboard/products`),
      cta:    'Add Product',
      expandable: false,
    },
    {
      key:    'product5',
      label:  'Add 5 products',
      done:   has5Products,
      action: () => navigate(`/s/${slug}/admin/dashboard/products`),
      cta:    'Add Products',
      expandable: false,
    },
    {
      key:    'share',
      label:  'Share your website link',
      done:   hasShared,
      action: () => {
        navigator.clipboard.writeText(`${PROD_BASE}/s/${slug}`).then(() => {
          localStorage.setItem(`artspace_shared_${slug}`, '1');
          toast.success('Link copied! Share it with your customers.');
          forceUpdate(n => n + 1);
        });
      },
      cta:    'Copy Link',
      expandable: false,
    },
  ];

  const doneCount = steps.filter(s => s.done).length;
  const pct       = Math.round((doneCount / steps.length) * 100);
  const allDone   = doneCount === steps.length;

  if (allDone) {
    if (!canInstall || !hasLogo) return null;
    return (
      <div className="mb-5 p-4 bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-4 h-4 text-violet-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-violet-900">Install the Admin App</p>
            <p className="text-xs text-violet-600 mt-0.5">
              Manage your shop from your home screen — no browser needed.
            </p>
          </div>
          <button
            onClick={onInstall}
            className="flex-shrink-0 px-3 py-1.5 text-xs font-semibold text-white rounded-lg transition-all hover:opacity-90"
            style={{ background: '#7c3aed' }}
          >
            Install
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-5 bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setCollapsed(v => !v)}
        className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-sm font-semibold text-gray-900">Complete Your Shop</p>
            <span className="text-xs font-semibold text-violet-600">{pct}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #7c3aed, #a78bfa)' }}
            />
          </div>
        </div>
        <div className="flex-shrink-0 text-gray-400">
          {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </div>
      </button>

      {/* Steps */}
      {!collapsed && (
        <div className="border-t border-gray-50 divide-y divide-gray-50">
          {steps.map((step) => (
            <div key={step.key}>
              <div className="flex items-center gap-3 px-4 py-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    step.done ? 'bg-green-500 border-green-500' : 'border-gray-300'
                  }`}
                >
                  {step.done && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className={`flex-1 text-sm ${step.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                  {step.label}
                </span>
                {!step.done && (
                  <button
                    onClick={step.action}
                    className="flex-shrink-0 px-2.5 py-1 text-xs font-semibold text-violet-600 bg-violet-50 border border-violet-100 rounded-lg hover:bg-violet-100 transition-all whitespace-nowrap"
                  >
                    {step.cta}
                  </button>
                )}
              </div>

              {/* Inline services panel */}
              {step.key === 'services' && servicesExpanded && !step.done && (
                <ServicesSetupPanel
                  slug={slug}
                  tenant={tenant}
                  onDone={() => {
                    setServicesExpanded(false);
                    forceUpdate(n => n + 1);
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const AdminSidebar = ({ slug, businessName, onLogout, mobileOpen, onClose, unreadCount, canInstall, onInstall, hasLogo }) => {
  const NAV_ITEMS = [
    { label: 'Dashboard',        icon: LayoutDashboard, to: `/s/${slug}/admin/dashboard/home` },
    { label: 'Inbox',            icon: Inbox,           to: `/s/${slug}/admin/dashboard/inbox`,    badge: unreadCount },
    { label: 'Tasks',            icon: CalendarCheck,   to: `/s/${slug}/admin/dashboard/calendar` },
    { label: 'Analytics',        icon: BarChart2,       to: `/s/${slug}/admin/dashboard/analytics` },
    { label: 'Products',         icon: Package,         to: `/s/${slug}/admin/dashboard/products` },
    { label: 'Categories',       icon: Tag,             to: `/s/${slug}/admin/dashboard/categories` },
    { label: 'Style Quiz',       icon: HelpCircle,      to: `/s/${slug}/admin/dashboard/quiz` },
    { label: 'FAQ',              icon: MessageSquare,   to: `/s/${slug}/admin/dashboard/faq` },
    { label: 'Blog',             icon: BookOpen,        to: `/s/${slug}/admin/dashboard/blog` },
    { label: 'Subscription',     icon: CreditCard,      to: `/s/${slug}/admin/dashboard/subscription` },
    { label: 'Website Settings', icon: Settings,        to: `/s/${slug}/admin/dashboard/settings` },
  ];

  // Gate: only show install if logo exists
  const showInstall = canInstall && hasLogo;

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
          {showInstall && (
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
const DashboardHome = ({ unreadCount, unreadLoading, taskSummary, taskLoading, canInstall, onInstall }) => {
  const { tenant }  = useTenant();
  const { slug }    = useParams();
  const navigate    = useNavigate();
  const { user }    = useAuth();

  const [productCount,   setProductCount]   = useState(0);
  const [productLoading, setProductLoading] = useState(true);
  const [showWelcome,    setShowWelcome]    = useState(false);

  useEffect(() => {
    if (tenant?.businessName) {
      document.title = `Dashboard — ${tenant.businessName} Admin`;
    }
  }, [tenant]);

  // Fetch product count
  useEffect(() => {
    api.get('/tenant/products')
      .then(res => setProductCount((res.data.data || []).length))
      .catch(() => {})
      .finally(() => setProductLoading(false));
  }, []);

  // Welcome modal: show once per slug
  useEffect(() => {
    if (!slug) return;
    const key = `artspace_welcomed_${slug}`;
    if (!localStorage.getItem(key)) {
      setShowWelcome(true);
      localStorage.setItem(key, '1');
    }
  }, [slug]);

  const handleCloseWelcome = () => setShowWelcome(false);
  const handleWelcomeAddProduct = () => {
    setShowWelcome(false);
    navigate(`/s/${slug}/admin/dashboard/products`);
  };

  // Show stat cards only when there's meaningful data
  const hasActivity =
    unreadCount > 0 ||
    (taskSummary.todayAppointments ?? 0) > 0 ||
    (taskSummary.todayDeliveries ?? 0) > 0;

  return (
    <div className="p-6">
      {/* Welcome modal */}
      {showWelcome && (
        <WelcomeModal
          slug={slug}
          onClose={handleCloseWelcome}
          onAddProduct={handleWelcomeAddProduct}
        />
      )}

      {/* Always-visible shop URL card */}
      <ShopUrlCard slug={slug} />

      {/* Setup checklist */}
      {!productLoading && (
        <SetupChecklist
          slug={slug}
          tenant={tenant}
          productCount={productCount}
          canInstall={canInstall}
          onInstall={onInstall}
        />
      )}

      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Welcome back{user?.businessName ? `, ${user.businessName}` : ''}.
        </p>
      </div>

      {/* Stat cards — only shown when there's something to show */}
      {hasActivity && (
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
      )}

      {/* Empty state nudge — shown instead of zeroed-out cards */}
      {!hasActivity && !unreadLoading && !taskLoading && (
        <div
          className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-100 rounded-xl cursor-pointer hover:bg-violet-50 hover:border-violet-100 transition-all"
          onClick={() => navigate(`/s/${slug}/admin/dashboard/products`)}
        >
          <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
            <Package className="w-4 h-4 text-violet-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800">Add products to get started</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Queries and bookings will appear here once customers find your shop.
            </p>
          </div>
          <span className="text-xs font-semibold text-violet-600 flex-shrink-0">Add →</span>
        </div>
      )}
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
  const { tenant }       = useTenant();
  const navigate         = useNavigate();
  const { canInstall, install } = usePWAInstall();

  const [accountStatus, setAccountStatus] = useState(null);
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [unreadLoading, setUnreadLoading] = useState(true);
  const [taskSummary,   setTaskSummary]   = useState({});
  const [taskLoading,   setTaskLoading]   = useState(true);
  const [trialInfo,     setTrialInfo]     = useState(null);

  // Logo gate for PWA install
  const hasLogo = !!tenant?.websiteConfig?.logo;

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
      api.get('/subscription/status').then((res) => {
  if (res.data.plan === 'trial' && res.data.daysRemaining <= 3) {
    setTrialInfo({ daysRemaining: res.data.daysRemaining });
  }
}).catch(() => {});
      const interval = setInterval(() => {
        if (!document.hidden) fetchUnreadCount();
      }, 30_000);
      return () => clearInterval(interval);
    }
  }, [accountStatus, fetchUnreadCount, fetchTaskSummary]);

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

  // ── Pending manual activation ─────────────────────────────────────────────
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

  // ── Network error ─────────────────────────────────────────────────────────
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
        hasLogo={hasLogo}
      />
      <div className="lg:ml-60 min-h-screen flex flex-col">
        {/* Trial warning banner */}
        {trialInfo && (
          <TrialBanner daysRemaining={trialInfo.daysRemaining} slug={slug} />
        )}

        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
          <button onClick={() => setMobileOpen(true)} className="text-gray-500 hover:text-gray-700" aria-label="Open menu">
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-gray-900 truncate flex-1">
            {user?.businessName || 'Admin'}
          </span>
          {canInstall && hasLogo && (
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
            <Route
              path="home"
              element={
                <DashboardHome
                  unreadCount={unreadCount}
                  unreadLoading={unreadLoading}
                  taskSummary={taskSummary}
                  taskLoading={taskLoading}
                  canInstall={canInstall}
                  onInstall={install}
                />
              }
            />
            <Route path="inbox"             element={<InboxPage />} />
            <Route path="calendar"          element={<TodoCalendarPage />} />
            <Route path="products"          element={<ProductsPage />} />
            <Route path="categories"        element={<CategoriesPage />} />
            <Route path="quiz"              element={<QuizBuilderPage />} />
            <Route path="faq"               element={<FAQManagerPage />} />
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