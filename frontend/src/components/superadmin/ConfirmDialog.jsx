import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ title, message, onConfirm, onCancel, variant = 'default' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 z-10">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${variant === 'destructive' ? 'bg-red-100' : 'bg-amber-100'}`}>
          <AlertTriangle size={20} className={variant === 'destructive' ? 'text-red-600' : 'text-amber-600'} />
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h3>
        <p className="text-sm text-gray-500 mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            style={{ fontFamily: "'Inter', sans-serif" }}>
            Cancel
          </button>
          <button onClick={onConfirm}
            className={`px-4 py-2 text-sm rounded-lg font-medium text-white transition-colors ${variant === 'destructive' ? 'bg-red-600 hover:bg-red-700' : 'bg-violet-600 hover:bg-violet-700'}`}
            style={{ fontFamily: "'Inter', sans-serif" }}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}