import { useState } from 'react';
import { X, Percent, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '../../../api/axiosInstance';
import toast from 'react-hot-toast';

export default function BulkDiscountModal({
  products,
  onClose,
  onAllUpdated,
  deliveryEnabled = true,
  appointmentEnabled = true,
}) {
  const bothEnabled = deliveryEnabled && appointmentEnabled;
  const defaultApplyTo = bothEnabled ? 'both' : deliveryEnabled ? 'delivery' : 'appointment';

  const [type, setType] = useState('percentage');
  const [value, setValue] = useState('');
  const [applyTo, setApplyTo] = useState(defaultApplyTo);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [applying, setApplying] = useState(false);
  const [results, setResults] = useState(null); // null | { succeeded: [], failed: [] }

  const effectiveApplyTo = !bothEnabled
    ? deliveryEnabled ? 'delivery' : 'appointment'
    : applyTo;

  const numVal = parseFloat(value) || 0;

  const handleApply = async () => {
    if (!value || numVal <= 0) {
      toast.error('Enter a discount value greater than 0');
      return;
    }
    setApplying(true);
    const succeeded = [];
    const failed = [];

    for (const product of products) {
      try {
        const res = await api.post(`/tenant/products/${product._id}/discount`, {
          type,
          value: numVal,
          applyTo: effectiveApplyTo,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        });
        succeeded.push({ product, updated: res.data.data });
      } catch (err) {
        failed.push({ product, reason: err.response?.data?.message || 'Failed' });
      }
    }

    setApplying(false);
    setResults({ succeeded, failed });
    if (succeeded.length > 0) onAllUpdated(succeeded.map((s) => s.updated));
    if (failed.length === 0) toast.success(`Discount applied to all ${succeeded.length} products`);
    else if (succeeded.length === 0) toast.error('Failed to apply discount to all products');
    else toast(`Applied to ${succeeded.length}, failed for ${failed.length}`, { icon: '⚠️' });
  };

  // Results view
  if (results) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-gray-900">Bulk Discount Results</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={!applying ? onClose : undefined} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Bulk Apply Discount</h3>
            <p className="text-xs text-gray-400 mt-0.5">{products.length} product{products.length > 1 ? 's' : ''} selected</p>
          </div>
          {!applying && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          )}
        </div>

        {/* Selected product names preview */}
        <div className="mb-5 mt-3 p-3 bg-violet-50 border border-violet-100 rounded-lg max-h-24 overflow-y-auto">
          <div className="flex flex-wrap gap-1.5">
            {products.map((p) => (
              <span key={p._id} className="px-2 py-0.5 bg-violet-100 text-violet-700 rounded text-xs font-medium truncate max-w-[140px]">
                {p.name}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {/* Discount Type */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Discount Type</label>
            <div className="flex gap-2">
              {['percentage', 'fixed'].map((t) => (
                <button
                  key={t}
                  onClick={() => { setType(t); setValue(''); }}
                  disabled={applying}
                  className="flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-all"
                  style={
                    type === t
                      ? { background: '#ede9fe', color: '#6d28d9', borderColor: '#c4b5fd' }
                      : { background: 'white', color: '#6b7280', borderColor: '#e5e7eb' }
                  }
                >
                  {t === 'percentage' ? '% Percentage' : '₹ Fixed Amount'}
                </button>
              ))}
            </div>
          </div>

          {/* Value */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              {type === 'percentage' ? 'Percentage (1–99)' : 'Amount (₹)'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                {type === 'percentage' ? '%' : '₹'}
              </span>
              <input
                type="number"
                min="1"
                max={type === 'percentage' ? 99 : undefined}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0"
                disabled={applying}
                className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 disabled:bg-gray-50"
              />
            </div>
          </div>

          {/* Apply To */}
          {bothEnabled && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Apply To</label>
              <div className="flex gap-2">
                {[
                  { label: 'Both', value: 'both' },
                  { label: 'Delivery only', value: 'delivery' },
                  { label: 'Appointment only', value: 'appointment' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setApplyTo(opt.value)}
                    disabled={applying}
                    className="flex-1 px-2 py-2 text-xs font-medium rounded-lg border transition-all"
                    style={
                      applyTo === opt.value
                        ? { background: '#ede9fe', color: '#6d28d9', borderColor: '#c4b5fd' }
                        : { background: 'white', color: '#6b7280', borderColor: '#e5e7eb' }
                    }
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1.5">Start Date & Time (optional)</label>
    <input
      type="datetime-local"
      value={startDate}
      onChange={(e) => setStartDate(e.target.value)}
      min={new Date().toISOString().slice(0, 16)}
      disabled={applying}
      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 disabled:bg-gray-50"
    />
  </div>
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1.5">End Date & Time (optional)</label>
    <input
      type="datetime-local"
      value={endDate}
      onChange={(e) => setEndDate(e.target.value)}
      min={new Date().toISOString().slice(0, 16)}
      disabled={applying}
      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 disabled:bg-gray-50"
    />
  </div>
</div>

          {/* Note about fixed discount */}
          {type === 'fixed' && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              Note: Fixed discount will fail for products where the discount amount exceeds their price. Use percentage for safer bulk application.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            disabled={applying}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={applying}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-all disabled:opacity-60"
            style={{ background: 'var(--color-primary, #8b5cf6)' }}
          >
            {applying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Applying…
              </>
            ) : (
              <>
                <Percent className="w-4 h-4" />
                Apply to {products.length} product{products.length > 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}