import SuperAdminLayout from '../../../layouts/SuperAdminLayout';
import { ScrollText } from 'lucide-react';

export default function SuperAdminAuditPlaceholder() {
  return (
    <SuperAdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Audit Log
          </h1>
          <p className="text-sm text-gray-500 mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
            Immutable record of all super admin actions
          </p>
        </div>
      </div>
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col items-center justify-center py-24 text-center">
        <ScrollText className="w-10 h-10 text-gray-300 mb-3" />
        <p className="text-sm font-medium text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>
          Coming in Phase 15
        </p>
        <p className="text-xs text-gray-400 mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
          Full audit trail — append-only, cannot be edited or deleted
        </p>
      </div>
    </SuperAdminLayout>
  );
}