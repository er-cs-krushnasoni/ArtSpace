import { useEffect, useRef } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

/**
 * Reusable confirm dialog for destructive actions.
 *
 * Props:
 *   open        – boolean
 *   onClose     – () => void
 *   onConfirm   – () => void
 *   title       – string
 *   description – string
 *   confirmLabel – string (default "Delete")
 *   isDestructive – boolean (default true) — red vs violet confirm button
 *   isLoading   – boolean
 */
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  isDestructive = true,
  isLoading = false,
}) {
  const confirmRef = useRef(null);

  useEffect(() => {
    if (open) confirmRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-sm p-6 animate-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className={`w-11 h-11 rounded-full flex items-center justify-center mb-4 ${
          isDestructive ? 'bg-red-50' : 'bg-violet-50'
        }`}>
          {isDestructive
            ? <Trash2 className="w-5 h-5 text-red-500" />
            : <AlertTriangle className="w-5 h-5 text-violet-500" />
          }
        </div>

        <h2 className="text-base font-semibold text-gray-900 mb-1.5">{title}</h2>
        <p className="text-sm text-gray-500 mb-6">{description}</p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-60 ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-violet-600 hover:bg-violet-700'
            }`}
          >
            {isLoading ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}