import { useState, useEffect, useRef } from 'react';
import { CheckCircle2, XCircle, Loader2, AlertTriangle, Copy, Check } from 'lucide-react';
import api from '../../../api/axiosInstance';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { tokenStore } from '../../../api/tokenStore';

const PROD_BASE = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';

export default function SlugSection({ currentSlug }) {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const { slug } = useParams();

  const [isEditing, setIsEditing] = useState(false);
  const [inputSlug, setInputSlug] = useState(currentSlug);
  const [availability, setAvailability] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!isEditing) return;
    if (inputSlug === currentSlug) { setAvailability(null); return; }
    if (!inputSlug) { setAvailability(null); return; }

    setAvailability('checking');
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get('/tenant/settings/slug/check', { params: { slug: inputSlug } });
        if (res.data.available) setAvailability('available');
        else setAvailability(res.data.reason === 'invalid_format' ? 'invalid' : 'taken');
      } catch {
        setAvailability(null);
      }
    }, 500);

    return () => clearTimeout(debounceRef.current);
  }, [inputSlug, isEditing, currentSlug]);

  const handleChangeClick = () => {
    setIsEditing(true);
    setInputSlug(currentSlug);
    setAvailability(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setInputSlug(currentSlug);
    setAvailability(null);
    setShowWarning(false);
  };

  const handleConfirmClick = () => {
    if (availability !== 'available') return;
    setShowWarning(true);
  };

  const handleFinalConfirm = async () => {
    setSaving(true);
    try {
      await api.put('/tenant/settings/slug', { newSlug: inputSlug });

      toast.success('Shop URL updated — redirecting to new admin login…');

      // Preserve the current access token so it survives the redirect
      const currentToken = tokenStore.get();

      // Update AuthContext with new slug while keeping token alive
      if (user) {
        login(currentToken, { ...user, slug: inputSlug });
      }

      // Small delay so toast is visible, then hard navigate to new login URL.
      // We use window.location.href (full page reload) so React Router
      // re-initializes cleanly under the new slug path. The httpOnly refresh
      // cookie is still valid so the user will be silently re-authenticated
      // at the new URL.
      setTimeout(() => {
        window.location.href = `${PROD_BASE}/s/${inputSlug}/admin/login`;
      }, 1500);

    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update URL');
      setSaving(false);
      setShowWarning(false);
    }
  };

  const handleCopy = () => {
  navigator.clipboard.writeText(shopUrl).then(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  });
};

  const shopUrl = `${PROD_BASE}/s/${isEditing ? inputSlug : currentSlug}`;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-1">Shop URL</h2>
      <p className="text-xs text-gray-400 mb-5">Your public shop address shared with customers</p>

      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg mb-4">
  <span className="text-xs text-gray-500 font-mono break-all flex-1">{shopUrl}</span>
  <button
    onClick={handleCopy}
    title="Copy URL"
    className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-200 transition-all text-gray-400 hover:text-gray-700"
  >
    Copy link{copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-3 h-3" />}
  </button>
</div>

      {!isEditing ? (
        <button
          onClick={handleChangeClick}
          className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg text-gray-700 hover:border-violet-400 hover:text-violet-600 transition-all"
        >
          Change URL
        </button>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">New Slug</label>
            <div className="relative">
              <input
                type="text"
                value={inputSlug}
                onChange={(e) => setInputSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pr-10 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all"
                placeholder="your-shop-name"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {availability === 'checking' && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
                {availability === 'available' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                {(availability === 'taken' || availability === 'invalid') && <XCircle className="w-4 h-4 text-red-500" />}
              </div>
            </div>
            {availability === 'available' && <p className="text-xs text-green-600 mt-1">✓ Available</p>}
            {availability === 'taken' && <p className="text-xs text-red-500 mt-1">This slug is already taken</p>}
            {availability === 'invalid' && <p className="text-xs text-red-500 mt-1">Lowercase letters, numbers, and hyphens only</p>}
            {inputSlug === currentSlug && <p className="text-xs text-gray-400 mt-1">Same as current slug</p>}
          </div>

          {showWarning && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Your old shop URL will stop working immediately</p>
                <p className="text-xs text-amber-700 mt-1">
                  Anyone with the old link will get a 404. You will be redirected to the new admin login.
                  An email with your new URLs will be sent to you.
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleFinalConfirm}
                    disabled={saving}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-all disabled:opacity-60"
                  >
                    {saving ? 'Updating…' : 'Yes, change URL'}
                  </button>
                  <button
                    onClick={() => setShowWarning(false)}
                    className="px-3 py-1.5 text-xs font-medium text-amber-700 border border-amber-300 rounded-lg hover:bg-amber-100 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {!showWarning && (
            <div className="flex gap-3">
              <button
                onClick={handleConfirmClick}
                disabled={availability !== 'available' || inputSlug === currentSlug}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all disabled:opacity-40"
                style={{ background: 'var(--color-primary, #8b5cf6)' }}
              >
                Confirm Change
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}