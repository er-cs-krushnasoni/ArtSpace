import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import SuperAdminLayout from '../../layouts/SuperAdminLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';

// ─── Status pill helper ───────────────────────────────────────────────────────
const StatusPill = ({ status }) => {
  const styles = {
    active: 'bg-green-100 text-green-800',
    expired: 'bg-red-100 text-red-800',
    paused: 'bg-amber-100 text-amber-800',
    inactive: 'bg-gray-100 text-gray-700',
    trial: 'bg-violet-100 text-violet-800',
    pending_manual: 'bg-blue-100 text-blue-800',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {status?.replace('_', ' ')}
    </span>
  );
};

// ─── Plan pill helper ─────────────────────────────────────────────────────────
const PlanPill = ({ plan }) => {
  const styles = {
    trial: 'bg-violet-100 text-violet-700',
    '1m': 'bg-blue-100 text-blue-700',
    '3m': 'bg-indigo-100 text-indigo-700',
    '6m': 'bg-cyan-100 text-cyan-700',
    '12m': 'bg-teal-100 text-teal-700',
    custom: 'bg-orange-100 text-orange-700',
  };
  const labels = {
    trial: 'Trial',
    '1m': '1 Month',
    '3m': '3 Months',
    '6m': '6 Months',
    '12m': '12 Months',
    custom: 'Custom',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[plan] || 'bg-gray-100 text-gray-700'}`}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {labels[plan] || plan}
    </span>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, iconColor }) => (
  <div className="bg-gray-50 rounded-xl p-4">
    <div className="flex items-start justify-between">
      <div>
        <p
          className="text-xs text-gray-500 mb-1"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {label}
        </p>
        <p
          className="text-2xl font-semibold text-gray-900"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {value ?? '—'}
        </p>
      </div>
      <div className={`p-2 rounded-lg ${iconColor}`}>
        <Icon size={18} />
      </div>
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SuperAdminDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Redirect if not super admin
  useEffect(() => {
    if (!authLoading && user?.role !== 'superadmin') {
      navigate('/superadmin/login', { replace: true });
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/superadmin/stats');
        setStats(response.data);
      } catch {
        setError('Failed to load dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading && user?.role === 'superadmin') {
      fetchStats();
    }
  }, [authLoading, user]);

  if (authLoading) {
    return (
      <SuperAdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-violet-600" size={24} />
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-xl font-semibold text-gray-900"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Dashboard
          </h1>
          <p
            className="text-sm text-gray-500 mt-0.5"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Platform overview
          </p>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
          <p className="text-sm text-red-600" style={{ fontFamily: "'Inter', sans-serif" }}>
            {error}
          </p>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Tenants"
          value={isLoading ? '…' : stats?.totalTenants}
          icon={Building2}
          iconColor="bg-gray-100 text-gray-500"
        />
        <StatCard
          label="Active Tenants"
          value={isLoading ? '…' : stats?.activeTenants}
          icon={CheckCircle}
          iconColor="bg-green-50 text-green-600"
        />
        <StatCard
          label="Trial Tenants"
          value={isLoading ? '…' : stats?.trialTenants}
          icon={Clock}
          iconColor="bg-violet-50 text-violet-600"
        />
        <StatCard
          label="Expired Tenants"
          value={isLoading ? '…' : stats?.expiredTenants}
          icon={AlertCircle}
          iconColor="bg-red-50 text-red-500"
        />
      </div>

      {/* Recent Tenants Table */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2
            className="text-sm font-semibold text-gray-900"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Recent Tenants
          </h2>
          <p
            className="text-xs text-gray-400 mt-0.5"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Last 5 registered shops
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-violet-500" size={20} />
          </div>
        ) : !stats?.recentTenants?.length ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Building2 className="w-10 h-10 text-gray-300 mb-3" />
            <p
              className="text-sm font-medium text-gray-500"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              No tenants yet
            </p>
            <p
              className="text-xs text-gray-400 mt-1"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Shops will appear here once they sign up
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Business Name', 'Slug', 'Plan', 'Status', 'Expiry'].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentTenants.map((tenant) => (
                  <tr
                    key={tenant._id}
                    className="hover:bg-gray-50/60 transition-colors duration-150"
                  >
                    <td className="px-5 py-3.5">
                      <span
                        className="text-sm font-medium text-gray-900"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        {tenant.businessName}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="text-sm text-gray-500 font-mono"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        /s/{tenant.slug}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <PlanPill plan={tenant.plan} />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusPill status={tenant.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="text-sm text-gray-500"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        {tenant.planExpiryDate
                          ? new Date(tenant.planExpiryDate).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
}