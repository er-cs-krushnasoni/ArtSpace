import SuperAdminSidebar from '../components/superadmin/SuperAdminSidebar';

export default function SuperAdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <SuperAdminSidebar />
      {/* lg: offset for fixed sidebar; mobile: just top padding for the hamburger */}
      <main className="lg:ml-60 min-h-screen p-6 pt-16 lg:pt-6">
        {children}
      </main>
    </div>
  );
}