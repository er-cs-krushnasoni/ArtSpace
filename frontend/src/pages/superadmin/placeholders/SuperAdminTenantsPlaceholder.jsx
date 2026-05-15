import SuperAdminLayout from '../../../layouts/SuperAdminLayout';
import { Building2 } from 'lucide-react';

export default function SuperAdminTenantsPlaceholder() {
  return (
    <SuperAdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Tenants
          </h1>
          <p className="text-sm text-gray-500 mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
            Manage all tenant accounts
          </p>
        </div>
      </div>
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col items-center justify-center py-24 text-center">
        <Building2 className="w-10 h-10 text-gray-300 mb-3" />
        <p className="text-sm font-medium text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>
          Coming in Phase 15
        </p>
        <p className="text-xs text-gray-400 mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
          Full tenant management with actions, filters, and audit trail
        </p>
      </div>
    </SuperAdminLayout>
  );
}