import { AlertCircle } from 'lucide-react';

const DuplicateDialog = ({ shopName, onUpdate, onCancel, isUpdating }) => {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'color-mix(in srgb, var(--tenant-primary) 12%, transparent)' }}
        >
          <AlertCircle size={24} style={{ color: 'var(--tenant-primary)' }} />
        </div>

        <h3
          className="text-base font-semibold text-gray-900 mb-2"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Request Already Exists
        </h3>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          You already have a pending request with{' '}
          <span className="font-medium text-gray-700">{shopName}</span>.
          Would you like to update it with your new details?
        </p>

        <div className="flex flex-col gap-2">
          <button
            onClick={onUpdate}
            disabled={isUpdating}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: 'var(--tenant-primary)' }}
          >
            {isUpdating ? 'Updating…' : 'Update my request'}
          </button>
          <button
            onClick={onCancel}
            disabled={isUpdating}
            className="w-full py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Keep existing request
          </button>
        </div>
      </div>
    </div>
  );
};

export default DuplicateDialog;