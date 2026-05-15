import { useTenant } from '../../context/TenantContext';

const UnavailablePage = () => {
  const { tenant } = useTenant();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fafafa',
        fontFamily: 'system-ui, sans-serif',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      {tenant?.logo && (
        <img
          src={tenant.logo}
          alt={tenant.businessName}
          style={{ width: 80, height: 80, objectFit: 'contain', marginBottom: '1.5rem', borderRadius: 12 }}
        />
      )}
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111', marginBottom: '0.5rem' }}>
        {tenant?.businessName || 'This Store'}
      </h1>
      <p style={{ color: '#666', maxWidth: 400, lineHeight: 1.6 }}>
        This website is temporarily unavailable. Please check back later.
      </p>
    </div>
  );
};

export default UnavailablePage;
