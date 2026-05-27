import { useState } from 'react';
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
  const location = useLocation();
  const { slug } = useParams();

  const config = tenant?.websiteConfig || {};
  const businessName = tenant?.businessName || '';

  const navLinks = [
    { label: 'Home', to: `/s/${slug}` },
    { label: labels.shop || 'Shop', to: `/s/${slug}/shop` },
    { label: labels.custom_order || 'Custom Order', to: `/s/${slug}/custom-order` },
    ...(config.appointmentEnabled
      ? [{ label: labels.book_appointment || 'Book Appointment', to: `/s/${slug}/appointment` }]
      : []),
    ...(config.quizEnabled ? [{ label: labels.quiz_name || 'Style Quiz', to: `/s/${slug}/quiz` }] : []),
    ...(config.blogEnabled ? [{ label: 'Blog', to: `/s/${slug}/blog` }] : []),
  ];

  const isActive = (to) => {
    if (to === `/s/${slug}`) return location.pathname === `/s/${slug}`;
    return location.pathname.startsWith(to);
  };

  const activeStyle = (to) => ({
  color: isActive(to) ? 'var(--tenant-primary)' : 'var(--tenant-nav-text, #4b5563)',
  background: isActive(to) ? 'color-mix(in srgb, var(--tenant-primary) 10%, transparent)' : 'transparent',
});

const mobileActiveStyle = (to) => ({
  color: isActive(to) ? 'var(--tenant-primary)' : 'var(--tenant-nav-text, #374151)',
  background: isActive(to) ? 'color-mix(in srgb, var(--tenant-primary) 10%, transparent)' : 'transparent',
});

  return (
<header className="border-b border-gray-100 sticky top-0 z-50" style={{ background: 'var(--tenant-nav-bg, var(--tenant-bg))' }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-[72px] gap-3">
          <Link to={`/s/${slug}`} className="flex items-center gap-3 min-w-0 flex-shrink-0">
  {config.logo && (
    <img
      src={config.logo}
      alt={businessName}
      className="w-16 h-16 rounded-2xl object-contain flex-shrink-0 border border-gray-100 shadow-sm"
    />
  )}
  <div className="flex flex-col min-w-0">
    <span
      className="font-bold text-gray-900 truncate"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.5rem', letterSpacing: '-0.01em', color: 'var(--tenant-nav-text, #111827)' }}
    >
      {businessName}
    </span>
    {config.address && (
      <div className="flex items-center gap-1 mt-0.5">
        <MapPin size={11} className="text-gray-400 flex-shrink-0" />
        <span className="text-xs text-gray-400 truncate">{config.address}</span>
      </div>
    )}
  </div>
</Link>
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 whitespace-nowrap"
                style={activeStyle(link.to)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            {config.whatsapp && (<a
              
                href={`https://wa.me/${config.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white transition-opacity hover:opacity-90"
                style={{ background: '#25D366' }}
              >
                <MessageCircle size={14} />
                WhatsApp
              </a>
            )}
            {config.instagram && (<a
              
                href={`https://instagram.com/${config.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}
              >
                <InstagramIcon size={14} />
                Instagram
              </a>
            )}
          </div>
          <div className="md:hidden flex items-center gap-1.5 flex-shrink-0">
            {config.whatsapp && (<a
              
                href={`https://wa.me/${config.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-8 h-8 rounded-full text-white flex-shrink-0"
                style={{ background: '#25D366' }}
                aria-label="WhatsApp"
              >
                <MessageCircle size={15} />
              </a>
            )}
            {config.instagram && (<a
              
                href={`https://instagram.com/${config.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-8 h-8 rounded-full text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}
                aria-label="Instagram"
              >
                <InstagramIcon size={15} />
              </a>
            )}
            <button
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
       
      </div>
      {mobileMenuOpen && (
<div className="md:hidden border-t border-gray-100 px-4 pb-4" style={{ background: 'var(--tenant-nav-bg, var(--tenant-bg))' }}>
          <nav className="flex flex-col gap-1 pt-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={mobileActiveStyle(link.to)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default ShopHeader;
