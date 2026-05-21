import { useState } from 'react';
import { X } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import { getEffectivePrices } from './ProductCard';
import CountryCodeDropdown from './CountryCodeDropdown';
import ImageUploadArea from './ImageUploadArea';
import DuplicateDialog from './DuplicateDialog';
import OrderConfirmation from './OrderConfirmation';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const todayIST = () => {
  const now = new Date();
  const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  return ist.toISOString().split('T')[0];
};

const Field = ({ label, required, error, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const OrderFormModal = ({ product, preSelectedOrderType, onClose }) => {
  const { tenant } = useTenant();
  const slug = tenant?.slug;
  const config = tenant?.websiteConfig || {};
  const prices = getEffectivePrices(product);

  const canDelivery = !!config.deliveryEnabled && product.deliveryEnabled && prices.offersDelivery;
  const canAppointment = !!config.appointmentEnabled && product.appointmentEnabled && prices.offersAppointment;

  const resolveInitial = () => {
  if (preSelectedOrderType === 'delivery' && canDelivery) return 'delivery';
  if (preSelectedOrderType === 'appointment' && canAppointment) return 'at_shop';
  if (canDelivery && !canAppointment) return 'delivery';
  if (canAppointment && !canDelivery) return 'at_shop';
  return '';
};

  const [form, setForm] = useState({
    customerName: '',
    mobile: '',
    countryCode: '+91',
    instagram: '',
    preferredDate: '',
    preferredTime: '',
    orderType: resolveInitial(),
    address: '',
    descriptionText: '',
  });
  const [descImages, setDescImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [duplicate, setDuplicate] = useState(null);
  const [updatingDup, setUpdatingDup] = useState(false);

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.customerName.trim() || form.customerName.trim().length < 2)
      errs.customerName = 'Name must be at least 2 characters';
    if (!form.mobile.trim() || !/^\d{7,}$/.test(form.mobile.replace(/\s+/g, '')))
      errs.mobile = 'Enter a valid mobile number';
    if (!canDelivery && !canAppointment)
      errs.orderType = 'No ordering options available';
    else if (canDelivery && canAppointment && !form.orderType)
      errs.orderType = 'Please select an option';
    if ((form.orderType === 'delivery' || form.orderType === 'at_home') && !form.address.trim())
  errs.address = 'Address is required for delivery or home service';
    return errs;
  };

  const buildBody = () => ({
  type: 'SHOP_ORDER',
  customerName: form.customerName.trim(),
  mobile: form.mobile.replace(/\s+/g, ''),
  countryCode: form.countryCode,
  instagram: form.instagram.trim(),
  preferredDate: form.preferredDate || undefined,
  preferredTime: form.preferredTime || undefined,
  orderType: form.orderType || (canDelivery ? 'delivery' : 'at_shop'),
  address: form.address.trim(),
  productId: product._id,
  descriptionText: form.descriptionText.trim(),
  descriptionImages: descImages.map((i) => i.secure_url),
  referenceImages: [],
});

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      const body = buildBody();
      const res = await fetch(`${API_BASE}/public/${slug}/queries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.code === 'DUPLICATE_QUERY') {
        setDuplicate({ existingQueryId: json.existingQueryId, pendingBody: body });
        return;
      }
      if (!json.success) throw new Error(json.message || 'Submission failed');
      setSubmitted(true);
    } catch (err) {
      setErrors({ _form: err.message || 'Something went wrong. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!duplicate) return;
    setUpdatingDup(true);
    try {
      const { existingQueryId, pendingBody } = duplicate;
      const res = await fetch(`${API_BASE}/public/${slug}/queries/${existingQueryId}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pendingBody),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setDuplicate(null);
      setSubmitted(true);
    } catch {
      setErrors({ _form: 'Failed to update. Please try again.' });
      setDuplicate(null);
    } finally {
      setUpdatingDup(false);
    }
  };

  const handleKeepExisting = () => {
    setDuplicate(null);
    setErrors({ _form: `Your request is already with ${tenant?.businessName}. We'll get back to you soon.` });
  };

const showSelector = canDelivery || canAppointment;
  const effectiveOrderType = form.orderType || (canDelivery ? 'delivery' : 'pickup');
const showAddress = effectiveOrderType === 'delivery' || effectiveOrderType === 'at_home';
  const displayPrice = () => {
  if ((effectiveOrderType === 'delivery' || effectiveOrderType === 'pickup') && canDelivery)
    return prices.delivery === 0 ? 'Free' : `₹${prices.delivery}`;
  if ((effectiveOrderType === 'at_shop' || effectiveOrderType === 'at_home') && canAppointment)
    return prices.appointment === 0 ? 'Free' : `₹${prices.appointment}`;
  return null;
};

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        style={{ background: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      >
        <div
          className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
            <div>
              <h3
                className="font-semibold text-gray-900 text-base"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Place Order
              </h3>
              {product.nameVisible && (
                <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[260px]">{product.name}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5">
            {submitted ? (
              <OrderConfirmation
                shopName={tenant?.businessName}
                whatsapp={config.whatsapp}
                instagram={config.instagram}
                onClose={onClose}
              />
            ) : (
              <div className="space-y-4">

                {/* Name */}
                <Field label="Your Name" required error={errors.customerName}>
                  <input
                    type="text"
                    value={form.customerName}
                    onChange={(e) => set('customerName', e.target.value)}
                    placeholder="Full name"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400 transition-colors"
                  />
                </Field>

                {/* Mobile */}
                <Field label="WhatsApp Number" required error={errors.mobile}>
                  <div className="flex items-stretch rounded-lg border border-gray-200 h-[42px]">
                    <CountryCodeDropdown
                      value={form.countryCode}
                      onChange={(v) => set('countryCode', v)}
                    />
                    <input
                      type="tel"
                      value={form.mobile}
                      onChange={(e) => set('mobile', e.target.value.replace(/\D/g, ''))}
                      placeholder="Mobile number"
                      className="flex-1 px-3 text-sm focus:outline-none bg-white rounded-r-lg"
                    />
                  </div>
                </Field>

                {/* Instagram */}
                <Field label="Instagram (optional)">
                  <input
                    type="text"
                    value={form.instagram}
                    onChange={(e) => set('instagram', e.target.value)}
                    placeholder="@handle"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400 transition-colors"
                  />
                </Field>

                {/* Date + Time row */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Preferred Date (optional)">
                    <input
                      type="date"
                      value={form.preferredDate}
                      min={todayIST()}
                      onChange={(e) => set('preferredDate', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400 transition-colors"
                    />
                  </Field>
                  <Field label="Preferred Time (optional)">
                    <input
                      type="time"
                      value={form.preferredTime}
                      onChange={(e) => set('preferredTime', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400 transition-colors"
                    />
                  </Field>
                </div>

                {/* Order Type selector */}
{showSelector && (
  <Field label="How would you like it?" required error={errors.orderType}>
    <div className="grid grid-cols-2 gap-2">
      {canDelivery && (
        <>
          <button
            type="button"
            onClick={() => set('orderType', 'delivery')}
            className="py-2.5 rounded-xl text-sm font-medium border-2 transition-all"
            style={
              form.orderType === 'delivery'
                ? { borderColor: 'var(--tenant-primary)', color: 'var(--tenant-primary)', background: 'color-mix(in srgb, var(--tenant-primary) 8%, transparent)' }
                : { borderColor: '#e5e7eb', color: '#4b5563' }
            }
          >
            Delivery · {prices.delivery === 0 ? 'Free' : `₹${prices.delivery}`}
          </button>
          <button
            type="button"
            onClick={() => set('orderType', 'pickup')}
            className="py-2.5 rounded-xl text-sm font-medium border-2 transition-all"
            style={
              form.orderType === 'pickup'
                ? { borderColor: 'var(--tenant-primary)', color: 'var(--tenant-primary)', background: 'color-mix(in srgb, var(--tenant-primary) 8%, transparent)' }
                : { borderColor: '#e5e7eb', color: '#4b5563' }
            }
          >
            Pickup · {prices.delivery === 0 ? 'Free' : `₹${prices.delivery}`}
          </button>
        </>
      )}
      {canAppointment && (
        <>
          <button
            type="button"
            onClick={() => set('orderType', 'at_shop')}
            className="py-2.5 rounded-xl text-sm font-medium border-2 transition-all"
            style={
              form.orderType === 'at_shop'
                ? { borderColor: 'var(--tenant-primary)', color: 'var(--tenant-primary)', background: 'color-mix(in srgb, var(--tenant-primary) 8%, transparent)' }
                : { borderColor: '#e5e7eb', color: '#4b5563' }
            }
          >
            At Shop · {prices.appointment === 0 ? 'Free' : `₹${prices.appointment}`}
          </button>
          {config.appointmentAtHome !== false && (
            <button
              type="button"
              onClick={() => set('orderType', 'at_home')}
              className="py-2.5 rounded-xl text-sm font-medium border-2 transition-all"
              style={
                form.orderType === 'at_home'
                  ? { borderColor: 'var(--tenant-primary)', color: 'var(--tenant-primary)', background: 'color-mix(in srgb, var(--tenant-primary) 8%, transparent)' }
                  : { borderColor: '#e5e7eb', color: '#4b5563' }
              }
            >
              At Home · {prices.appointment === 0 ? 'Free' : `₹${prices.appointment}`}
            </button>
          )}
        </>
      )}
    </div>
  </Field>
)}

                {/* Single option price banner */}
                {!showSelector && displayPrice() && (
  <div
    className="flex items-center justify-between p-3 rounded-xl"
    style={{ background: 'color-mix(in srgb, var(--tenant-primary) 8%, transparent)' }}
  >
    <span className="text-sm font-medium" style={{ color: 'var(--tenant-primary)' }}>
      {canDelivery ? 'Delivery / Pickup' : 'Appointment'}
    </span>
    <span className="text-sm font-bold" style={{ color: 'var(--tenant-primary)' }}>
      {displayPrice()}
    </span>
  </div>
)}

                {/* Address */}
                {showAddress && (
                  <Field label="Delivery Address" required error={errors.address}>
                    <textarea
                      value={form.address}
                      onChange={(e) => set('address', e.target.value)}
                      placeholder="Full address for delivery"
                      rows={2}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400 transition-colors resize-none"
                    />
                  </Field>
                )}

                {/* Tutorial video */}
                {showAddress && config.tutorialVideoUrl && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1.5">Watch before ordering</p>
                    <video
                      src={config.tutorialVideoUrl}
                      controls
                      className="w-full rounded-xl bg-black"
                      style={{ maxHeight: '200px' }}
                    />
                  </div>
                )}

                {/* Description */}
                <Field label="Special Requests (optional)">
                  <textarea
                    value={form.descriptionText}
                    onChange={(e) => set('descriptionText', e.target.value)}
                    placeholder="Any specific instructions or requests…"
                    rows={3}
                    maxLength={500}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400 transition-colors resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-0.5 text-right">{form.descriptionText.length}/500</p>
                </Field>

                {/* Description images */}
                <ImageUploadArea
                  slug={slug}
                  label="Attach Images (optional)"
                  images={descImages}
                  onChange={setDescImages}
                  maxImages={3}
                />

                {errors._form && (
                  <p className="text-sm text-center py-2 px-3 bg-red-50 text-red-600 rounded-lg">{errors._form}</p>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ background: 'var(--tenant-primary)' }}
                >
                  {submitting ? 'Sending…' : 'Send Request'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {duplicate && (
        <DuplicateDialog
          shopName={tenant?.businessName}
          onUpdate={handleUpdate}
          onCancel={handleKeepExisting}
          isUpdating={updatingDup}
        />
      )}
    </>
  );
};

export default OrderFormModal;