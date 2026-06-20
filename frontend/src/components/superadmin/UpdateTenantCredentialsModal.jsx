import { useState } from 'react';
import { Loader2, Eye, EyeOff, KeyRound } from 'lucide-react';
import api from '../../api/axiosInstance';

export default function UpdateTenantCredentialsModal({ tenant, onClose, onSuccess }) {
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newMobile, setNewMobile] = useState('');

  const handle = async () => {
    if (!newEmail.trim() && !newPassword.trim() && !newMobile.trim()) {
      setError('Provide at least a new email or new password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.patch(`/superadmin/tenants/${tenant._id}/credentials`, {
        newEmail:    newEmail.trim()    || undefined,
        newPassword: newPassword.trim() || undefined,
        newMobile:   newMobile.trim()   || undefined,
      });
      onSuccess('Tenant credentials updated and notified by email');
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
        {/* Icon + title */}
        <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center mb-4">
          <KeyRound size={18} className="text-violet-600" />
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-1"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Update Tenant Credentials
        </h3>
        <p className="text-sm text-gray-500 mb-5"
          style={{ fontFamily: "'Inter', sans-serif" }}>
          Updating credentials for <strong>{tenant.businessName}</strong>. Leave a field blank to keep it unchanged. The tenant will be notified by email.
        </p>

        {error && (
          <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-100 rounded-lg">
            <p className="text-sm text-red-600" style={{ fontFamily: "'Inter', sans-serif" }}>{error}</p>
          </div>
        )}

        <div className="space-y-4 mb-6">
          {/* New Email */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5"
              style={{ fontFamily: "'Inter', sans-serif" }}>
              New Email <span className="text-gray-400 font-normal">(leave blank to keep current)</span>
            </label>
            <input
              type="email"
              placeholder={tenant.email}
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300"
              style={{ fontFamily: "'Inter', sans-serif" }}
            />
          </div>

          {/* New Mobile */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5"
              style={{ fontFamily: "'Inter', sans-serif" }}>
              New Mobile <span className="text-gray-400 font-normal">(leave blank to keep current)</span>
            </label>
            <input
              type="tel"
              placeholder={tenant.mobile || 'e.g. +919876543210'}
              value={newMobile}
              onChange={e => setNewMobile(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300"
              style={{ fontFamily: "'Inter', sans-serif" }}
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5"
              style={{ fontFamily: "'Inter', sans-serif" }}>
              New Password <span className="text-gray-400 font-normal">(leave blank to keep current)</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
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
            Update Credentials
          </button>
        </div>
      </div>
    </div>
  );
}