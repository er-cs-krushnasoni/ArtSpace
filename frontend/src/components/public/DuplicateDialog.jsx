import { AlertCircle } from 'lucide-react';

const DuplicateDialog = ({ shopName, onUpdate, onCancel, isUpdating }) => {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center"
        style={{
          animation: 'dupDialogIn 0.25s cubic-bezier(0.34,1.3,0.64,1) both',
        }}
      >
        {/* Icon */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'color-mix(in srgb, var(--tenant-primary) 12%, transparent)' }}
        >
          <AlertCircle size={26} style={{ color: 'var(--tenant-primary)' }} />
        </div>

        <h3
          className="text-base font-bold text-gray-900 dark:text-zinc-50 mb-2"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Request Already Exists
        </h3>

        <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6 leading-relaxed">
          You already have a pending request with{' '}
          <span className="font-semibold text-gray-700 dark:text-zinc-200">{shopName}</span>.
          Would you like to update it with your new details?
        </p>

        <div className="flex flex-col gap-2">
          <button
            onClick={onUpdate}
            disabled={isUpdating}
            className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: 'var(--tenant-primary)' }}
          >
            {isUpdating ? 'Updating…' : 'Update my request'}
          </button>
          <button
            onClick={onCancel}
            disabled={isUpdating}
            className="w-full py-2.5 rounded-2xl text-sm font-medium text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-700 transition-colors"
          >
            Keep existing request
          </button>
        </div>
      </div>

      <style>{`
        @keyframes dupDialogIn {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default DuplicateDialog;