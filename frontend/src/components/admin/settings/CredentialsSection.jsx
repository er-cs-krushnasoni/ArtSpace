import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import api from '../../../api/axiosInstance';
import toast from 'react-hot-toast';

const PasswordInput = ({ value, onChange, show, onToggle, placeholder }) => (
  <div className="relative">
    <input
      type={show ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all"
    />
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
    >
      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  </div>
);

export default function CredentialsSection({ initialData }) {
  // ── Email state ──────────────────────────────────────────────────────────
  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);

  // ── Password state ───────────────────────────────────────────────────────
  const [editingPassword, setEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // ── Email handlers ───────────────────────────────────────────────────────
  const handleEmailCancel = () => {
    setEditingEmail(false);
    setNewEmail('');
  };

  const handleEmailSave = async () => {
    if (!newEmail.trim()) return toast.error('Please enter a new email');
    setSavingEmail(true);
    try {
      await api.put('/tenant/settings/email', { newEmail: newEmail.trim() });
      toast.success('Email updated successfully');
      setEditingEmail(false);
      setNewEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update email');
    } finally {
      setSavingEmail(false);
    }
  };

  // ── Password handlers ────────────────────────────────────────────────────
  const handlePasswordCancel = () => {
    setEditingPassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handlePasswordSave = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return toast.error('Please fill in all password fields');
    }
    if (newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters');
    }
    if (newPassword !== confirmPassword) {
      return toast.error('New passwords do not match');
    }
    setSavingPassword(true);
    try {
      await api.put('/tenant/settings/password', { currentPassword, newPassword });
      toast.success('Password updated successfully');
      handlePasswordCancel();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-1">Account Credentials</h2>
      <p className="text-xs text-gray-400 mb-5">Update your login email and password</p>

      <div className="space-y-5">
        {/* ── Email row ── */}
        <div className="border border-gray-100 rounded-xl p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-500 mb-0.5">Login Email</p>
              <p className="text-sm text-gray-800 font-mono truncate">{initialData?.email || '—'}</p>
            </div>
            {!editingEmail && (
              <button
                onClick={() => setEditingEmail(true)}
                className="flex-shrink-0 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg text-gray-700 hover:border-violet-400 hover:text-violet-600 transition-all"
              >
                Change
              </button>
            )}
          </div>

          {editingEmail && (
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">New Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="new@example.com"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleEmailSave}
                  disabled={savingEmail}
                  className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all disabled:opacity-40"
                  style={{ background: 'var(--color-primary, #8b5cf6)' }}
                >
                  {savingEmail ? 'Saving…' : 'Save Email'}
                </button>
                <button
                  onClick={handleEmailCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Password row ── */}
        <div className="border border-gray-100 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-0.5">Password</p>
              <p className="text-sm text-gray-400 tracking-widest">••••••••</p>
            </div>
            {!editingPassword && (
              <button
                onClick={() => setEditingPassword(true)}
                className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg text-gray-700 hover:border-violet-400 hover:text-violet-600 transition-all"
              >
                Change
              </button>
            )}
          </div>

          {editingPassword && (
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Current Password</label>
                <PasswordInput
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  show={showCurrent}
                  onToggle={() => setShowCurrent((v) => !v)}
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">New Password</label>
                <PasswordInput
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  show={showNew}
                  onToggle={() => setShowNew((v) => !v)}
                  placeholder="Min. 6 characters"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Confirm New Password</label>
                <PasswordInput
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  show={showConfirm}
                  onToggle={() => setShowConfirm((v) => !v)}
                  placeholder="Repeat new password"
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
                {confirmPassword && newPassword === confirmPassword && confirmPassword.length > 0 && (
                  <p className="text-xs text-green-600 mt-1">✓ Passwords match</p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handlePasswordSave}
                  disabled={savingPassword}
                  className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all disabled:opacity-40"
                  style={{ background: 'var(--color-primary, #8b5cf6)' }}
                >
                  {savingPassword ? 'Saving…' : 'Save Password'}
                </button>
                <button
                  onClick={handlePasswordCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}