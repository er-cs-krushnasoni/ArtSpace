const SetupIncompletePage = () => (
  <div
    className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center"
    style={{ fontFamily: "'Inter', sans-serif" }}
  >
    <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mb-5">
      <span style={{ fontSize: '2rem' }}>🎨</span>
    </div>
    <h1
      className="text-2xl font-semibold text-gray-900 mb-2"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      ArtSpace
    </h1>
    <p className="text-gray-500 max-w-sm leading-relaxed text-sm">
      This shop is being set up. Check back soon!
    </p>
  </div>
);

export default SetupIncompletePage;