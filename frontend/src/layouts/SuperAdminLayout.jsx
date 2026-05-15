import SuperAdminSidebar from '../components/superadmin/SuperAdminSidebar';

/**
 * Wraps all super admin pages with the dark sidebar + content area layout.
 */
export default function SuperAdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <SuperAdminSidebar />
      {/* Content area — offset by sidebar width */}
      <main className="ml-60 min-h-screen p-6">
        {children}
      </main>
    </div>
  );
}