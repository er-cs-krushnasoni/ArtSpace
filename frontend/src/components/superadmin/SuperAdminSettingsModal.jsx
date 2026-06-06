import { useState } from 'react';
import { Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import api from '../../api/axiosInstance';

export default function SuperAdminSettingsModal({ onClose }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handle = async () => {
    if (!currentPassword.trim()) { setError('Current password is required.'); return; }
    if (!newEmail.trim() && !newPassword.trim()) { setError('Provide at least a new email or new password.'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await api.patch('/superadmin/auth/credentials', {
        currentPassword,
        newEmail: newEmail.trim() || undefined,
        newPassword: newPassword.trim() || undefined,
      });
      setSuccess('Credentials updated. You may need to log in again if you changed your email.');
      setCurrentPassword(''); setNewEmail(''); setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 z-10">
        <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center mb-4">
          <ShieldCheck size={18} className="text-violet-600" />
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-1"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Update My Credentials
        </h3>
        <p className="text-sm text-gray-500 mb-5" style={{ fontFamily: "'Inter', sans-serif" }}>
          Change your Super Admin email or password. Current password is required to confirm.
        </p>

        {error && (
          <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-100 rounded-lg">
            <p className="text-sm text-red-600" style={{ fontFamily: "'Inter', sans-serif" }}>{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-4 px-3 py-2.5 bg-green-50 border border-green-100 rounded-lg">
            <p className="text-sm text-green-700" style={{ fontFamily: "'Inter', sans-serif" }}>{success}</p>
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5"
              style={{ fontFamily: "'Inter', sans-serif" }}>
              Current Password <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                placeholder="Your current password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
              <button type="button" onClick={() => setShowCurrent(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5"
              style={{ fontFamily: "'Inter', sans-serif" }}>
              New Email <span className="text-gray-400 font-normal">(leave blank to keep current)</span>
            </label>
            <input
              type="email"
              placeholder="new@email.com"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300"
              style={{ fontFamily: "'Inter', sans-serif" }}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5"
              style={{ fontFamily: "'Inter', sans-serif" }}>
              New Password <span className="text-gray-400 font-normal">(leave blank to keep current)</span>
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
              <button type="button" onClick={() => setShowNew(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
            style={{ fontFamily: "'Inter', sans-serif" }}>
            Cancel
          </button>
          <button onClick={handle} disabled={loading}
            className="px-4 py-2 text-sm rounded-lg font-medium text-white flex items-center gap-2 disabled:opacity-60"
            style={{ backgroundColor: '#8b5cf6', fontFamily: "'Inter', sans-serif" }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = '#7c3aed'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#8b5cf6'; }}>
            {loading && <Loader2 size={14} className="animate-spin" />}
            Update
          </button>
        </div>
      </div>
    </div>
  );
}