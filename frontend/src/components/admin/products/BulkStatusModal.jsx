import { useState } from 'react';
import { X, ToggleLeft, ToggleRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import api from '../../../api/axiosInstance';
import toast from 'react-hot-toast';

/**
 * BulkStatusModal
 * Props:
 *  - products: Product[]        — the selected products
 *  - onClose: () => void
 *  - onAllUpdated: (updatedList: Product[]) => void
 */
export default function BulkStatusModal({ products, onClose, onAllUpdated }) {
  const [targetStatus, setTargetStatus] = useState('active'); // 'active' | 'inactive'
  const [results, setResults] = useState(null); // null = not started yet
  const [running, setRunning] = useState(false);

  const isActive = targetStatus === 'active';

  // Derive counts for preview
  const alreadyCount = products.filter((p) => p.isActive === isActive).length;
  const toChangeCount = products.length - alreadyCount;

  const handleApply = async () => {
    setRunning(true);
    const settled = await Promise.allSettled(
      products.map((p) =>
        api
          .put(`/tenant/products/${p._id}`, { isActive })
          .then((res) => ({ product: p, updated: res.data.data, ok: true }))
          .catch((err) => ({
            product: p,
            ok: false,
            error: err.response?.data?.message || 'Failed',
          }))
      )
    );

    const mapped = settled.map((s) => s.value);
    setResults(mapped);
    setRunning(false);

    const succeeded = mapped.filter((r) => r.ok).map((r) => r.updated);
    const failCount = mapped.filter((r) => !r.ok).length;

    if (succeeded.length) {
      onAllUpdated(succeeded);
      toast.success(
        `${succeeded.length} product${succeeded.length !== 1 ? 's' : ''} ${isActive ? 'activated' : 'deactivated'}`
      );
    }
    if (failCount) {
      toast.error(`${failCount} product${failCount !== 1 ? 's' : ''} failed`);
    }
  };

  const allDone = results !== null;
  const successCount = results?.filter((r) => r.ok).length ?? 0;
  const failCount = results?.filter((r) => !r.ok).length ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={!running ? onClose : undefined} />

      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            Bulk Status Change
          </h2>
          {!running && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="p-5 space-y-5">
          {!allDone ? (
            <>
              {/* Target status selector */}
              <div>
                <p className="text-xs font-medium text-gray-600 mb-3">Set selected products to</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'active', label: 'Active', icon: ToggleRight, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-300' },
                    { value: 'inactive', label: 'Inactive', icon: ToggleLeft, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-300' },
                  ].map(({ value, label, icon: Icon, color, bg, border }) => (
                    <button
                      key={value}
                      onClick={() => setTargetStatus(value)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        targetStatus === value
                          ? `${bg} ${color} ${border}`
                          : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview summary */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
                <div className="flex justify-between text-gray-700">
                  <span>Selected products</span>
                  <span className="font-medium">{products.length}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Already {isActive ? 'active' : 'inactive'}</span>
                  <span>{alreadyCount}</span>
                </div>
                <div className="flex justify-between font-medium text-gray-900 pt-1 border-t border-gray-200">
                  <span>Will be updated</span>
                  <span>{toChangeCount}</span>
                </div>
              </div>

              {toChangeCount === 0 && (
                <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                  All selected products are already {isActive ? 'active' : 'inactive'}.
                </p>
              )}
            </>
          ) : (
            /* Results view */
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {failCount === 0 ? (
                  <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-amber-500 flex-shrink-0" />
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {successCount} updated successfully
                  </p>
                  {failCount > 0 && (
                    <p className="text-xs text-red-500 mt-0.5">{failCount} failed</p>
                  )}
                </div>
              </div>

              {/* Per-product result list */}
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {results.map(({ product, ok, error }) => (
                  <div
                    key={product._id}
                    className={`flex items-center justify-between text-xs px-3 py-2 rounded-lg ${
                      ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                    }`}
                  >
                    <span className="truncate max-w-[180px]">{product.name}</span>
                    <span className="flex-shrink-0 font-medium">
                      {ok ? (isActive ? 'Activated' : 'Deactivated') : error}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 pb-5">
          {!allDone ? (
            <>
              <button
                onClick={onClose}
                disabled={running}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={running || toChangeCount === 0}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-all disabled:opacity-50"
                style={{ background: isActive ? '#16a34a' : '#6b7280' }}
              >
                {running ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Updating…
                  </>
                ) : (
                  `Set ${toChangeCount} ${isActive ? 'Active' : 'Inactive'}`
                )}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-all"
              style={{ background: 'var(--color-primary, #8b5cf6)' }}
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}