// frontend/src/components/public/ShopHeader.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Menu, X, MessageCircle, MapPin } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';

const InstagramIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
  </svg>
);

const ShopHeader = () => {
  const { tenant, labels } = useTenant();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { slug } = useParams();

  const config = tenant?.websiteConfig || {};
  const businessName = tenant?.businessName || '';

  // Glass effect on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'Home', to: `/s/${slug}` },
    { label: labels.shop || 'Shop', to: `/s/${slug}/shop` },
    { label: labels.custom_order || 'Custom Order', to: `/s/${slug}/custom-order` },
    ...(config.appointmentEnabled
      ? [{ label: labels.book_appointment || 'Book Appointment', to: `/s/${slug}/appointment` }]
      : []),
    ...(config.quizEnabled ? [{ label: labels.quiz_name || 'Style Quiz', to: `/s/${slug}/quiz` }] : []),
      ...(config.faqEnabled ? [{ label: 'FAQs', to: `/s/${slug}/faq` }] : []),
    ...(config.blogEnabled ? [{ label: 'Blog', to: `/s/${slug}/blog` }] : []),
  ];

  const isActive = (to) => {
    if (to === `/s/${slug}`) return location.pathname === `/s/${slug}`;
    return location.pathname.startsWith(to);
  };

  const activeLinkStyle = (to) => ({
  color: 'var(--tenant-nav-text, #1c1917)',
  background: isActive(to)
    ? 'color-mix(in srgb, var(--tenant-nav-text, #1c1917) 15%, transparent)'
    : 'transparent',
  fontWeight: isActive(to) ? '700' : '500',
  opacity: isActive(to) ? 1 : 0.65,
});

  const mobileActiveLinkStyle = (to) => ({
  color: 'var(--tenant-nav-text, #1c1917)',
  background: isActive(to)
    ? 'color-mix(in srgb, var(--tenant-nav-text, #1c1917) 15%, transparent)'
    : 'transparent',
  fontWeight: isActive(to) ? '700' : '500',
  opacity: isActive(to) ? 1 : 0.65,
  borderLeft: isActive(to)
    ? '3px solid var(--tenant-nav-text, #1c1917)'
    : '3px solid transparent',
});

  return (
  <header
    className="sticky top-0 z-50 transition-all duration-300"
    style={{
      background: scrolled
        ? 'color-mix(in srgb, var(--tenant-nav-bg, var(--tenant-bg)) 95%, transparent)'
        : 'var(--tenant-nav-bg, var(--tenant-bg))',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: '1px solid color-mix(in srgb, var(--tenant-nav-text, #1c1917) 8%, transparent)',
      boxShadow: scrolled ? '0 1px 16px 0 rgba(0,0,0,0.07)' : 'none',
    }}
  >
    <div className="max-w-6xl mx-auto px-4 sm:px-6">

      {/* ── Row 1: Logo + Name + Social ── */}
      <div className="flex items-center justify-between py-3 gap-3">
        {/* Logo + Business Name */}
        <Link to={`/s/${slug}`} className="flex items-center gap-3 min-w-0 group">
          {config.logo && (
            <img
              src={config.logo}
              alt={businessName}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-contain flex-shrink-0 border border-gray-100 dark:border-zinc-700 shadow-sm transition-transform duration-200 group-hover:scale-105"
            />
          )}
          <div className="flex flex-col min-w-0">
            <span
              className="font-bold leading-tight"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 'clamp(1.1rem, 3vw, 1.4rem)',
                letterSpacing: '-0.02em',
                color: 'var(--tenant-nav-text, #1c1917)',
                whiteSpace: 'normal',
                wordBreak: 'break-word',
              }}
            >
              {businessName}
            </span>
            {config.address && (
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin size={10} style={{ color: 'color-mix(in srgb, var(--tenant-nav-text, #1c1917) 40%, transparent)' }} className="flex-shrink-0 mt-0.5 self-start" />
                <span
                  className="text-xs leading-tight max-w-[260px] line-clamp-1"
                  style={{ color: 'color-mix(in srgb, var(--tenant-nav-text, #1c1917) 45%, transparent)' }}
                >
                  {config.address}
                </span>
              </div>
            )}
          </div>
        </Link>

        {/* Right: Social buttons + Mobile hamburger */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {config.whatsapp && (<a
            
              href={`https://wa.me/${config.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white transition-all duration-150 hover:opacity-90 hover:scale-105 border border-white/20"
              style={{ background: '#25D366' }}
            >
              <MessageCircle size={13} />
              WhatsApp
            </a>
          )}
          {config.whatsapp && (<a
            
              href={`https://wa.me/${config.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="sm:hidden flex items-center justify-center w-9 h-9 rounded-xl text-white flex-shrink-0 transition-transform hover:scale-105"
              style={{ background: '#25D366' }}
              aria-label="WhatsApp"
            >
              <MessageCircle size={16} />
            </a>
          )}
          {config.instagram && (<a
            
              href={`https://instagram.com/${config.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white transition-all duration-150 hover:opacity-90 hover:scale-105 border border-white/20"
              style={{ background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}
            >
              <InstagramIcon size={13} />
              Instagram
            </a>
          )}
          {config.instagram && (<a
            
              href={`https://instagram.com/${config.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="sm:hidden flex items-center justify-center w-9 h-9 rounded-xl text-white flex-shrink-0 transition-transform hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}
              aria-label="Instagram"
            >
              <InstagramIcon size={16} />
            </a>
          )}
          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-xl transition-colors duration-150"
            style={{
              color: 'var(--tenant-nav-text, #1c1917)',
              background: mobileMenuOpen
                ? 'color-mix(in srgb, var(--tenant-primary) 10%, transparent)'
                : 'transparent',
            }}
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ── Row 2: Desktop Nav (hidden on mobile) ── */}
      <nav
        className="hidden md:flex items-center gap-0.5 pb-1.5"
        style={{
          borderTop: '1px solid color-mix(in srgb, var(--tenant-nav-text, #1c1917) 6%, transparent)',
        }}
      >
        <div className="flex items-center gap-0.5 pt-1.5">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="px-3.5 py-1.5 rounded-xl text-sm transition-all duration-150 whitespace-nowrap"
              style={activeLinkStyle(link.to)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>

    {/* ── Mobile Menu ── */}
    <div
      className="md:hidden overflow-hidden transition-all duration-300 ease-in-out"
      style={{
        maxHeight: mobileMenuOpen ? '480px' : '0px',
        opacity: mobileMenuOpen ? 1 : 0,
      }}
    >
      <div
        className="px-4 pb-5 pt-2"
        style={{ background: 'var(--tenant-nav-bg, var(--tenant-bg))' }}
      >
        <nav className="flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 rounded-xl text-sm transition-all duration-150"
              style={mobileActiveLinkStyle(link.to)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  </header>
);
};

export default ShopHeader;