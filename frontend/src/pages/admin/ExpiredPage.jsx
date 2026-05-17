import { useState } from 'react';
import { Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SubscriptionPage from './SubscriptionPage';

export default function ExpiredPage({ slug }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showRenew, setShowRenew] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate(`/s/${slug}/admin/login`, { replace: true });
  };

  if (showRenew) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Minimal header strip */}
        <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setShowRenew(false)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <span className="text-sm font-medium text-gray-700">Renew Subscription</span>
        </div>
        <SubscriptionPage onPaymentSuccess={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-8 max-w-md w-full text-center">
        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-7 h-7 text-red-400" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Subscription Expired</h1>
        <p className="text-sm text-gray-500 mb-6">
          Your subscription has expired. Renew now to restore access to your dashboard and bring your shop back online.
        </p>
        <button
          onClick={() => setShowRenew(true)}
          className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg px-4 py-2.5 transition-all duration-200 mb-3"
        >
          Renew Subscription
        </button>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}