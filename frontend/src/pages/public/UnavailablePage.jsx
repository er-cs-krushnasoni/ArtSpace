import { useTenant } from '../../context/TenantContext';

const UnavailablePage = () => {
  const { tenant } = useTenant();
  const config = tenant?.websiteConfig || {};
  const primaryColor = config.primaryColor || '#7c3aed';

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center relative overflow-hidden"
      style={{ background: 'var(--tenant-bg, #fafaf9)', fontFamily: "'Inter', sans-serif" }}
    >
      {/* Decorative background blobs */}
      <div
        className="absolute top-[-140px] right-[-100px] w-[400px] h-[400px] rounded-full opacity-[0.06] pointer-events-none"
        style={{ background: `radial-gradient(circle, ${primaryColor}, transparent 70%)` }}
      />
      <div
        className="absolute bottom-[-100px] left-[-80px] w-[300px] h-[300px] rounded-full opacity-[0.04] pointer-events-none"
        style={{ background: `radial-gradient(circle, ${primaryColor}, transparent 70%)` }}
      />

      {/* Card */}
      <div
        className="relative z-10 max-w-sm w-full rounded-3xl px-8 py-10 text-center"
        style={{
          background: 'var(--tenant-card-bg, #ffffff)',
          boxShadow: '0 4px 32px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)',
        }}
      >
        {/* Logo or fallback emoji */}
        {config.logo ? (
          <img
            src={config.logo}
            alt={tenant?.businessName}
            className="w-20 h-20 object-contain rounded-2xl mx-auto mb-5 border shadow-sm"
            style={{ borderColor: 'color-mix(in srgb, var(--tenant-nav-text, #1c1917) 8%, transparent)' }}
          />
        ) : (
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: `color-mix(in srgb, ${primaryColor} 12%, transparent)` }}
          >
            <span style={{ fontSize: '2rem', lineHeight: 1 }}>🏪</span>
          </div>
        )}

        {/* Business name */}
        <h1
          className="text-2xl font-bold mb-3 leading-snug"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: 'var(--tenant-nav-text, #1c1917)',
          }}
        >
          {tenant?.businessName || 'This Shop'}
        </h1>

        {/* Status badge */}
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4"
          style={{
            background: `color-mix(in srgb, ${primaryColor} 10%, transparent)`,
            color: primaryColor,
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: primaryColor, opacity: 0.7 }}
          />
          Temporarily Unavailable
        </div>

        {/* Message */}
        <p
          className="text-sm leading-relaxed"
          style={{ color: 'color-mix(in srgb, var(--tenant-nav-text, #1c1917) 55%, transparent)' }}
        >
          We're taking a short break. Please check back a little later — we'll be back soon!
        </p>
      </div>

      <p className="relative z-10 text-xs text-gray-400 mt-6">
        Powered by ArtSpace
      </p>
    </div>
  );
};

export default UnavailablePage;