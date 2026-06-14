import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import api from '../../../api/axiosInstance';
import toast from 'react-hot-toast';
export default function DiscountModal({
  product,
  onClose,
  onUpdated,
  deliveryEnabled = true,
  appointmentEnabled = true,
}) {
  const hasDiscount = product.discount?.isActive;
  const bothEnabled = deliveryEnabled && appointmentEnabled;
  // Determine default applyTo from existing discount or fallback
  const getDefaultApplyTo = () => {
    if (hasDiscount && product.discount.applyTo) return product.discount.applyTo;
    if (bothEnabled) return 'both';
    if (deliveryEnabled) return 'delivery';
    return 'appointment';
  };
  const [type, setType] = useState(product.discount?.type || 'percentage');
  const [value, setValue] = useState(product.discount?.value?.toString() || '');
  const [applyTo, setApplyTo] = useState(getDefaultApplyTo());
  const [startDate, setStartDate] = useState(
    product.discount?.startDate
      ? new Date(product.discount.startDate).toISOString().slice(0, 16)
      : ''
  );
  const [endDate, setEndDate] = useState(
    product.discount?.endDate
      ? new Date(product.discount.endDate).toISOString().slice(0, 16)
      : ''
  );
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  // Derive the actual applyTo to send — state only matters when both are enabled
  const effectiveApplyTo = !bothEnabled
    ? deliveryEnabled ? 'delivery' : 'appointment'
    : applyTo;

  // Original prices (before discount)
  const origDelivery = hasDiscount
    ? product.discount.originalDeliveryPrice
    : product.deliveryPrice;
  const origAppt = hasDiscount
    ? product.discount.originalAppointmentPrice
    : product.appointmentPrice;
  // Live preview calculation
  const numVal = parseFloat(value) || 0;
  const calcDiscounted = (orig) => {
    if (numVal <= 0) return orig;
    if (type === 'percentage') return Math.round(orig * (1 - numVal / 100));
    return Math.max(0, orig - numVal);
  };
  const showDeliveryPreview = deliveryEnabled && (effectiveApplyTo === 'both' || effectiveApplyTo === 'delivery');
  const showApptPreview = appointmentEnabled && (effectiveApplyTo === 'both' || effectiveApplyTo === 'appointment');
  const previewDelivery = calcDiscounted(origDelivery);
  const previewAppt = calcDiscounted(origAppt);
  const handleApply = async () => {
    if (!value || numVal <= 0) {
      toast.error('Enter a discount value greater than 0');
      return;
    }
    setSaving(true);
    try {
      const res = await api.post(`/tenant/products/${product._id}/discount`, {
        type,
        value: numVal,
        applyTo: effectiveApplyTo,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      onUpdated(res.data.data);
      toast.success('Discount applied');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply discount');
    } finally {
      setSaving(false);
    }
  };
  const handleRemove = async () => {
    setRemoving(true);
    try {
      const res = await api.delete(`/tenant/products/${product._id}/discount`);
      onUpdated(res.data.data);
      toast.success('Discount removed');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove discount');
    } finally {
      setRemoving(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              {hasDiscount ? 'Manage Discount' : 'Apply Discount'}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{product.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Current discount info */}
        {hasDiscount && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-lg">
            <p className="text-xs font-medium text-amber-800">Active discount</p>
            <p className="text-sm text-amber-700 mt-0.5">
              {product.discount.type === 'percentage'
                ? `${product.discount.value}% off`
                : `₹${product.discount.value} off`}
              {product.discount.applyTo && product.discount.applyTo !== 'both' && (
                <span className="ml-1 text-amber-600">
                  ({product.discount.applyTo === 'delivery' ? 'Delivery only' : 'Appointment only'})
                </span>
              )}
              {' — '}
              {deliveryEnabled && `Delivery ₹${product.deliveryPrice}`}
              {deliveryEnabled && appointmentEnabled && ' · '}
              {appointmentEnabled && `Appointment ₹${product.appointmentPrice}`}
            </p>
          </div>
        )}
        <div className="space-y-4">
          {/* Discount Type */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Discount Type</label>
            <div className="flex gap-2">
              {['percentage', 'fixed'].map((t) => (
                <button
                  key={t}
                  onClick={() => { setType(t); setValue(''); }}
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
                className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
              />
            </div>
          </div>
          {/* Apply To — only shown when both are enabled */}
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Start Date & Time (optional)
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                End Date & Time (optional)
              </label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
              />
            </div>
          </div>
          {/* Live Preview */}
          {numVal > 0 && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs font-medium text-gray-500 mb-2">Preview</p>
              <div className="space-y-1">
                {showDeliveryPreview && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Delivery</span>
                    <span>
                      <span className="line-through text-gray-400 text-xs mr-1.5">₹{origDelivery}</span>
                      <span className="font-semibold text-gray-900">₹{previewDelivery}</span>
                    </span>
                  </div>
                )}
                {showApptPreview && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Appointment</span>
                    <span>
                      <span className="line-through text-gray-400 text-xs mr-1.5">₹{origAppt}</span>
                      <span className="font-semibold text-gray-900">₹{previewAppt}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {/* Actions */}
        <div className="flex gap-2 mt-6">
          {hasDiscount && (
            <button
              onClick={handleRemove}
              disabled={removing}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-all disabled:opacity-60"
            >
              <Trash2 className="w-4 h-4" />
              {removing ? 'Removing…' : 'Remove Dis.'}
            </button>
          )}
          <div className="flex gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all disabled:opacity-60"
              style={{ background: 'var(--color-primary, #8b5cf6)' }}
            >
              {saving ? 'Applying…' : 'Apply Discount'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}