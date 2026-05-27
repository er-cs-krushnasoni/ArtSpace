import { useState } from 'react';
import { X, Trash2, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '../../../api/axiosInstance';
import toast from 'react-hot-toast';

export default function BulkRemoveDiscountModal({ products, onClose, onAllUpdated }) {
  const [removing, setRemoving] = useState(false);
  const [results, setResults] = useState(null); // null | { succeeded: [], failed: [] }

  const handleRemove = async () => {
    setRemoving(true);
    const succeeded = [];
    const failed = [];

    for (const product of products) {
      try {
        const res = await api.delete(`/tenant/products/${product._id}/discount`);
        succeeded.push({ product, updated: res.data.data });
      } catch (err) {
        failed.push({ product, reason: err.response?.data?.message || 'Failed' });
      }
    }

    setRemoving(false);
    setResults({ succeeded, failed });
    if (succeeded.length > 0) onAllUpdated(succeeded.map((s) => s.updated));
    if (failed.length === 0) toast.success(`Discount removed from all ${succeeded.length} products`);
    else if (succeeded.length === 0) toast.error('Failed to remove discount from all products');
    else toast(`Removed from ${succeeded.length}, failed for ${failed.length}`, { icon: '⚠️' });
  };

  // Results view
  if (results) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-gray-900">Bulk Remove Results</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {results.succeeded.map(({ product }) => (
              <div key={product._id} className="flex items-center gap-2.5 p-2.5 bg-green-50 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-sm text-green-800 truncate">{product.name}</span>
              </div>
            ))}
            {results.failed.map(({ product, reason }) => (
              <div key={product._id} className="flex items-start gap-2.5 p-2.5 bg-red-50 rounded-lg">
                <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-800 truncate">{product.name}</p>
                  <p className="text-xs text-red-500 mt-0.5">{reason}</p>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={onClose}
            className="mt-5 w-full px-4 py-2 text-sm font-medium text-white rounded-lg transition-all"
            style={{ background: 'var(--color-primary, #8b5cf6)' }}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // Confirm view
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={!removing ? onClose : undefined} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Remove Discounts</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {products.length} product{products.length > 1 ? 's' : ''} selected
            </p>
          </div>
          {!removing && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Selected product names preview */}
        <div className="mb-5 mt-3 p-3 bg-red-50 border border-red-100 rounded-lg max-h-24 overflow-y-auto">
          <div className="flex flex-wrap gap-1.5">
            {products.map((p) => (
              <span
                key={p._id}
                className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium truncate max-w-[140px]"
              >
                {p.name}
              </span>
            ))}
          </div>
        </div>

        <p className="text-sm text-gray-600">
          This will permanently remove the active discount from all selected products. Products without a discount will be skipped.
        </p>

        {/* Actions */}
        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            disabled={removing}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={handleRemove}
            disabled={removing}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all disabled:opacity-60"
          >
            {removing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Removing…
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Remove from {products.length} product{products.length > 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}