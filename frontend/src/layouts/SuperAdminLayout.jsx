import SuperAdminSidebar from '../components/superadmin/SuperAdminSidebar';

export default function SuperAdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <SuperAdminSidebar />
      <main className="ml-60 min-h-screen p-6">
        {children}
      </main>
    </div>
  );
}