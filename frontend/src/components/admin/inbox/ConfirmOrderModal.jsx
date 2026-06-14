import { useState, useEffect } from 'react';
import { X, CalendarCheck } from 'lucide-react';
import api from '../../../api/axiosInstance';
import toast from 'react-hot-toast';

const TYPE_BADGE = {
  SHOP_ORDER:   { label: 'Shop Order',   className: 'bg-violet-100 text-violet-800' },
  CUSTOM_ORDER: { label: 'Custom Order', className: 'bg-pink-100 text-pink-800' },
  APPOINTMENT:  { label: 'Appointment',  className: 'bg-blue-100 text-blue-800' },
};

const getOrderTypeOptions = (type, wc) => {
  const opts = [];
  if (type === 'SHOP_ORDER' || type === 'CUSTOM_ORDER') {
    opts.push({ value: 'pickup', label: 'Pickup' });
    if (wc?.deliveryEnabled) opts.push({ value: 'delivery', label: 'Delivery' });
  }
  if (type === 'SHOP_ORDER' || type === 'APPOINTMENT') {
    if (wc?.appointmentEnabled) {
      opts.push({ value: 'at_shop', label: 'Appt. at Shop' });
      if (wc?.appointmentAtHome) opts.push({ value: 'at_home', label: 'Appt. at Home' });
    }
  }
  return opts;
};

const inputClass =
  'w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition';

const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
      {label}
    </label>
    {children}
  </div>
);

const handleMobileKeyDown = (e) => {
  const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Enter'];
  if (allowed.includes(e.key)) return;
  if (e.ctrlKey || e.metaKey) return;
  if (!/^\d$/.test(e.key)) e.preventDefault();
};

export default function ConfirmOrderModal({ query, onClose, onConfirmed }) {
  const badge = TYPE_BADGE[query.type] || TYPE_BADGE.SHOP_ORDER;

  const defaultPrice = (() => {
    const { orderType, lockedDeliveryPrice, lockedAppointmentPrice, type } = query;
    if (type === 'CUSTOM_ORDER' || type === 'APPOINTMENT') return '';
    if (orderType === 'delivery' || orderType === 'pickup') {
      return lockedDeliveryPrice != null ? String(lockedDeliveryPrice) : '';
    }
    if (orderType === 'at_shop' || orderType === 'at_home') {
      return lockedAppointmentPrice != null ? String(lockedAppointmentPrice) : '';
    }
    return '';
  })();

  const [customerName,   setCustomerName]   = useState(query.customerName || '');
  const [mobile,         setMobile]         = useState(query.mobile || '');
  const [countryCode,    setCountryCode]    = useState(query.countryCode || '+91');
  const [instagram,      setInstagram]      = useState(query.instagram || '');
  const [orderType,      setOrderType]      = useState(query.orderType || '');
  const [address,        setAddress]        = useState(query.address || '');
  const [preferredDate,  setPreferredDate]  = useState(
    query.preferredDate ? new Date(query.preferredDate).toISOString().split('T')[0] : ''
  );
  const [preferredTime,  setPreferredTime]  = useState(query.preferredTime || '');
  const [descriptionText, setDescriptionText] = useState(query.descriptionText || '');
  const [scheduledDate,  setScheduledDate]  = useState(
    query.preferredDate ? new Date(query.preferredDate).toISOString().split('T')[0] : ''
  );
  const [scheduledTime,  setScheduledTime]  = useState(query.preferredTime || '');
  const [finalPrice,     setFinalPrice]     = useState(defaultPrice);
  const [loading,        setLoading]        = useState(false);

  const [tenantConfig, setTenantConfig] = useState(null);
  useEffect(() => {
    import('../../../api/axiosInstance').then(({ default: api }) => {
      api.get('/tenant/settings')
        .then((r) => setTenantConfig(r.data?.data?.websiteConfig || null))
        .catch(() => {});
    });
  }, []);
  const needsAddress = orderType === 'delivery' || orderType === 'at_home';
  const orderTypeOptions = getOrderTypeOptions(query.type, tenantConfig);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await api.post(`/tenant/inbox/${query._id}/confirm`, {
        scheduledDate:   scheduledDate || undefined,
        scheduledTime:   scheduledTime || undefined,
        finalPrice:      finalPrice !== '' ? Number(finalPrice) : undefined,
        customerName:    customerName.trim(),
        mobile:          mobile.trim(),
        countryCode,
        instagram:       instagram.trim() || undefined,
        orderType,
        address:         needsAddress ? address.trim() : '',
        preferredDate:   preferredDate || undefined,
        preferredTime:   preferredTime || undefined,
        descriptionText: descriptionText.trim() || undefined,
      });
      toast.success('Order confirmed and moved to calendar');
      onConfirmed(query._id);
    } catch {
      toast.error('Failed to confirm order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Sheet on mobile (slides up from bottom), centered dialog on sm+ */}
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-xl flex flex-col max-h-[92dvh] sm:max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 sm:px-5 sm:py-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-violet-600" />
            <h2 className="text-base font-semibold text-gray-900">Confirm Order</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 -mr-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5 space-y-4">

          {/* Query type badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
              {badge.label}
            </span>
            {query.productId?.name && (
              <span className="text-xs text-gray-500 truncate">
                {query.productId.nameVisible !== false ? query.productId.name : 'Product'}
              </span>
            )}
          </div>

          {/* ── Customer Details ─────────────────────────────── */}
          <div className="p-3 bg-gray-50 rounded-xl space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer Details</p>

            {/* Name — full width on mobile */}
            <Field label="Name">
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className={inputClass}
                placeholder="Customer name"
              />
            </Field>

            {/* Mobile number — stacked on mobile, side-by-side on sm+ */}
            <Field label="Mobile">
              <div className="flex gap-1.5">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="flex-shrink-0 w-[4.5rem] px-2 py-2.5 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400"
                >
                  {['+91', '+1', '+44', '+971', '+65', '+61', '+60'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <input
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={handleMobileKeyDown}
                  inputMode="numeric"
                  className={inputClass}
                  placeholder="Mobile number"
                />
              </div>
            </Field>

            <Field label="Instagram (optional)">
              <input
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className={inputClass}
                placeholder="@username"
              />
            </Field>
          </div>

          {/* ── Order Details ─────────────────────────────────── */}
          <div className="p-3 bg-gray-50 rounded-xl space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Order Details</p>

            <Field label="Order Type">
              <div className="flex flex-wrap gap-2">
                {orderTypeOptions.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setOrderType(value);
                      if (value !== 'delivery' && value !== 'at_home') setAddress('');
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                      orderType === value
                        ? 'border-violet-400 bg-violet-50 text-violet-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </Field>

            {needsAddress && (
              <Field label="Address">
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={inputClass}
                  rows={2}
                  placeholder="Delivery / at-home address"
                />
              </Field>
            )}

            <Field label="Description">
              <textarea
                value={descriptionText}
                onChange={(e) => setDescriptionText(e.target.value)}
                className={inputClass}
                rows={2}
                placeholder="Notes or special requests"
              />
            </Field>
          </div>

          {/* ── Schedule ──────────────────────────────────────── */}
          <div className="p-3 bg-gray-50 rounded-xl space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Schedule{' '}
              <span className="normal-case font-normal text-gray-400">(optional)</span>
            </p>

            {/* Stack on mobile, 2-col on sm+ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Scheduled Date">
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={inputClass}
                />
              </Field>
              <Field label="Scheduled Time">
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
          </div>

          {/* ── Pricing ───────────────────────────────────────── */}
          <div className="p-3 bg-violet-50 border border-violet-100 rounded-xl space-y-2">
            <p className="text-xs font-semibold text-violet-700 uppercase tracking-wide">
              Final Price{' '}
              <span className="normal-case font-normal text-violet-400">(optional — set now or later)</span>
            </p>

            {query.type === 'SHOP_ORDER' && defaultPrice !== '' && (
              <p className="text-xs text-gray-500">
                Product price:{' '}
                <span className="font-semibold text-gray-700">₹{defaultPrice}</span>
                {query.productId?.discount?.isActive && (
                  <span className="ml-1 text-green-600">(discounted)</span>
                )}
              </p>
            )}

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600 flex-shrink-0">₹</span>
              <input
                type="number"
                min="0"
                value={finalPrice}
                onChange={(e) => setFinalPrice(e.target.value)}
                className={inputClass}
                placeholder="Enter final price"
                inputMode="decimal"
              />
            </div>
            <p className="text-xs text-gray-400">
              Leave blank to set the price later from the calendar.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-4 py-4 sm:px-5 pt-0 flex-shrink-0 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: 'var(--color-primary)' }}
          >
            {loading ? 'Confirming…' : 'Confirm Order'}
          </button>
        </div>
      </div>
    </div>
  );
}