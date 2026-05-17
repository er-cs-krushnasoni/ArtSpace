import { PauseCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function PausedPage({ slug }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate(`/s/${slug}/admin/login`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-8 max-w-md w-full text-center">
        <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <PauseCircle className="w-7 h-7 text-amber-400" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Account Paused</h1>
        <p className="text-sm text-gray-500 mb-6">
          Your account has been temporarily paused by the platform administrator. Please contact support for assistance.
        </p>
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