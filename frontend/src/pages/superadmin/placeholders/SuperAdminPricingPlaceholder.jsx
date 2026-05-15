import SuperAdminLayout from '../../../layouts/SuperAdminLayout';
import { CreditCard } from 'lucide-react';

export default function SuperAdminPricingPlaceholder() {
  return (
    <SuperAdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Plans & Pricing
          </h1>
          <p className="text-sm text-gray-500 mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
            Set subscription plan prices
          </p>
        </div>
      </div>
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col items-center justify-center py-24 text-center">
        <CreditCard className="w-10 h-10 text-gray-300 mb-3" />
        <p className="text-sm font-medium text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>
          Coming in Phase 15
        </p>
        <p className="text-xs text-gray-400 mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
          Manage plan prices — changes apply to new purchases only
        </p>
      </div>
    </SuperAdminLayout>
  );
}