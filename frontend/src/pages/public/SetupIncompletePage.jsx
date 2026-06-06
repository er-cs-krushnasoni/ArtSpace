const SetupIncompletePage = () => (
  <div
    className="min-h-screen flex flex-col items-center justify-center px-4 text-center relative overflow-hidden"
    style={{ background: '#fafaf9', fontFamily: "'Inter', sans-serif" }}
  >
    {/* Decorative background blobs */}
    <div
      className="absolute top-[-120px] left-[-120px] w-[420px] h-[420px] rounded-full opacity-[0.07] pointer-events-none"
      style={{ background: 'radial-gradient(circle, #7c3aed, transparent 70%)' }}
    />
    <div
      className="absolute bottom-[-80px] right-[-80px] w-[320px] h-[320px] rounded-full opacity-[0.05] pointer-events-none"
      style={{ background: 'radial-gradient(circle, #f59e0b, transparent 70%)' }}
    />

    {/* Card */}
    <div
      className="relative z-10 max-w-sm w-full rounded-3xl px-8 py-10 text-center"
      style={{
        background: '#ffffff',
        boxShadow: '0 4px 32px rgba(124,58,237,0.08), 0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      {/* Icon */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
        style={{ background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)' }}
      >
        <span style={{ fontSize: '2rem', lineHeight: 1 }}>🎨</span>
      </div>

      {/* Brand */}
      <p
        className="text-xs font-bold uppercase tracking-widest mb-3"
        style={{ color: '#7c3aed' }}
      >
        ArtSpace
      </p>

      {/* Heading */}
      <h1
        className="text-2xl font-bold text-gray-900 mb-3 leading-snug"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        Almost ready!
      </h1>

      {/* Body */}
      <p className="text-sm text-gray-500 leading-relaxed mb-6">
        We're putting the finishing touches on this shop.
        Check back soon — it won't be long!
      </p>

      {/* Decorative dots */}
      <div className="flex items-center justify-center gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{
              background: i === 0 ? '#7c3aed' : '#e5e7eb',
              animation: `dotPulse 1.4s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>

    <p className="relative z-10 text-xs text-gray-400 mt-6">
      Powered by ArtSpace
    </p>

    <style>{`
      @keyframes dotPulse {
        0%, 80%, 100% { opacity: 0.3; transform: scale(0.85); }
        40%            { opacity: 1;   transform: scale(1.1); }
      }
    `}</style>
  </div>
);

export default SetupIncompletePage;