import { useTenant } from '../../context/TenantContext';

const UnavailablePage = () => {
  const { tenant } = useTenant();
  const config = tenant?.websiteConfig || {};

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {config.logo && (
        <img
          src={config.logo}
          alt={tenant?.businessName}
          className="w-20 h-20 object-contain rounded-2xl mb-5 border border-gray-100 shadow-sm"
        />
      )}
      <h1
        className="text-2xl font-semibold text-gray-900 mb-2"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {tenant?.businessName || 'This Shop'}
      </h1>
      <p className="text-gray-500 max-w-sm leading-relaxed text-sm">
        This shop is temporarily unavailable. Please check back later.
      </p>
    </div>
  );
};

export default UnavailablePage;