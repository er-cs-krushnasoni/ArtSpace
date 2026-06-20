// frontend/src/components/public/ProductDetailModal.jsx
import { useState } from 'react';
import { X, Tag } from 'lucide-react';
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

// ── Shared field wrapper ──────────────────────────────────────────────────────
const Field = ({ label, required, error, children }) => (
  <div>
    <label className="block text-sm font-medium mb-1.5 dark:text-zinc-300" style={{ color: 'var(--tenant-text, #374151)' }}>
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

// ── Shared input class ────────────────────────────────────────────────────────
const inputCls =
  'w-full px-3.5 py-3 rounded-xl border text-sm focus:outline-none transition-colors dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-600 dark:placeholder-zinc-500';
const inputStyle = {
  borderColor: 'color-mix(in srgb, var(--tenant-text, #374151) 18%, transparent)',
};

// ─── Delivery Form Modal ──────────────────────────────────────────────────────
const DeliveryFormModal = ({ product, onClose }) => {
  const { tenant } = useTenant();
  const slug   = tenant?.slug;
  const config = tenant?.websiteConfig || {};
  const prices = getEffectivePrices(product);

  const [form, setForm] = useState({
    customerName: '',
    mobile: '',
    countryCode: '+91',
    instagram: '',
    preferredDate: '',
    preferredTime: '',
    orderType: 'pickup',
    address: '',
    descriptionText: '',
  });
  const [descImages, setDescImages]   = useState([]);
  const [errors, setErrors]           = useState({});
  const [submitting, setSubmitting]   = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [duplicate, setDuplicate]     = useState(null);
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
    if (form.orderType === 'delivery' && !form.address.trim())
      errs.address = 'Address is required for delivery';
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
    orderType: form.orderType,
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
      const res  = await fetch(`${API_BASE}/public/${slug}/queries`, {
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
      setErrors({ _form: err.message || 'Something went wrong.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!duplicate) return;
    setUpdatingDup(true);
    try {
      const { existingQueryId, pendingBody } = duplicate;
      const res  = await fetch(`${API_BASE}/public/${slug}/queries/${existingQueryId}/update`, {
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

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        style={{ background: 'rgba(0,0,0,0.55)' }}
        onClick={onClose}
      >
        <div
          className="w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[94vh] overflow-y-auto overflow-x-hidden dark:border dark:border-zinc-700"
          style={{ background: 'var(--tenant-card-bg, #ffffff)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4 border-b sticky top-0 z-10 dark:border-zinc-700"
            style={{
              background: 'var(--tenant-card-bg, #ffffff)',
              borderColor: 'color-mix(in srgb, var(--tenant-text, #374151) 10%, transparent)',
            }}
          >
            <div>
              <h3
                className="font-bold text-base dark:text-zinc-100"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--tenant-text, #111827)' }}
              >
                {config.deliveryEnabled ? 'Buy' : 'Buy'}
              </h3>
              {product.nameVisible && (
                <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5 truncate max-w-[260px]">
                  {product.name}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

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
                {/* Price banner */}
                <div
                  className="flex items-center justify-between p-3.5 rounded-2xl"
                  style={{ background: 'color-mix(in srgb, var(--tenant-primary) 8%, transparent)' }}
                >
                  <span className="text-sm font-medium" style={{ color: 'var(--tenant-primary)' }}>
                    {form.orderType === 'delivery' ? 'Delivery Price' : 'Pickup Price'}
                  </span>
                  <span className="text-sm font-bold" style={{ color: 'var(--tenant-primary)' }}>
                    {prices.delivery === 0 ? 'Free' : `₹${prices.delivery}`}
                  </span>
                </div>

                {/* Name */}
                <Field label="Your Name" required error={errors.customerName}>
                  <input
                    type="text"
                    value={form.customerName}
                    onChange={(e) => set('customerName', e.target.value)}
                    placeholder="Full name"
                    className={inputCls}
                    style={inputStyle}
                  />
                </Field>

                {/* WhatsApp */}
                <Field label="WhatsApp Number" required error={errors.mobile}>
                  <div
                    className="flex items-stretch rounded-xl border overflow-hidden h-[46px] dark:border-zinc-600"
                    style={inputStyle}
                  >
                    <CountryCodeDropdown value={form.countryCode} onChange={(v) => set('countryCode', v)} />
                    <input
                      type="tel"
                      value={form.mobile}
                      onChange={(e) => set('mobile', e.target.value.replace(/\D/g, ''))}
                      placeholder="Mobile number"
                      className="flex-1 px-3 text-sm focus:outline-none dark:bg-zinc-800 dark:text-zinc-200 dark:placeholder-zinc-500"
                      style={{ background: 'var(--tenant-card-bg, #ffffff)' }}
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
                    className={inputCls}
                    style={inputStyle}
                  />
                </Field>

                {/* Order type */}
{config.deliveryEnabled && (
  <Field label="How would you like it?">
    <div className="grid grid-cols-2 gap-2">
      {[
        { value: 'pickup',   label: 'Pickup',   sub: 'You collect from us' },
        { value: 'delivery', label: 'Delivery', sub: 'We deliver to you' },
      ].map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => set('orderType', opt.value)}
          className="py-3 px-3.5 rounded-2xl text-sm font-semibold border-2 transition-all text-left"
          style={
            form.orderType === opt.value
              ? { borderColor: 'var(--tenant-primary)', color: 'var(--tenant-primary)', background: 'color-mix(in srgb, var(--tenant-primary) 8%, transparent)' }
              : { borderColor: 'color-mix(in srgb, var(--tenant-text, #374151) 15%, transparent)', color: 'var(--tenant-text, #6b7280)' }
          }
        >
          <div>{opt.label}</div>
          <div className="text-xs opacity-55 font-normal mt-0.5">{opt.sub}</div>
        </button>
      ))}
    </div>
  </Field>
)}

                {/* Address */}
                {form.orderType === 'delivery' && (
                  <Field label="Delivery Address" required error={errors.address}>
                    <textarea
                      value={form.address}
                      onChange={(e) => set('address', e.target.value)}
                      placeholder="Full address for delivery"
                      rows={2}
                      className={`${inputCls} resize-none`}
                      style={inputStyle}
                    />
                  </Field>
                )}

                {/* Tutorial video */}
                {form.orderType === 'delivery' && config.tutorialVideoUrl && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5">Watch before ordering</p>
                    <video
                      src={config.tutorialVideoUrl}
                      controls
                      className="w-full rounded-2xl bg-black"
                      style={{ maxHeight: '200px' }}
                    />
                  </div>
                )}

                {/* Date / Time */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Preferred Date (optional)">
                    <input
                      type="date"
                      value={form.preferredDate}
                      min={todayIST()}
                      onChange={(e) => set('preferredDate', e.target.value)}
                      className={inputCls}
                      style={inputStyle}
                    />
                  </Field>
                  <Field label="Preferred Time (optional)">
                    <input
                      type="time"
                      value={form.preferredTime}
                      onChange={(e) => set('preferredTime', e.target.value)}
                      className={inputCls}
                      style={inputStyle}
                    />
                  </Field>
                </div>

                {/* Special requests */}
                <Field label="Special Requests (optional)">
                  <textarea
                    value={form.descriptionText}
                    onChange={(e) => set('descriptionText', e.target.value)}
                    placeholder="Any specific instructions…"
                    rows={3}
                    maxLength={500}
                    className={`${inputCls} resize-none`}
                    style={inputStyle}
                  />
                  <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5 text-right">
                    {form.descriptionText.length}/500
                  </p>
                </Field>

                {/* Images */}
                <ImageUploadArea
                  slug={slug}
                  label="Attach Images (optional)"
                  images={descImages}
                  onChange={setDescImages}
                  maxImages={3}
                />

                {errors._form && (
                  <p className="text-sm text-center py-2.5 px-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl">
                    {errors._form}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full py-3.5 rounded-2xl text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ background: 'var(--tenant-primary)', color: 'var(--tenant-btn-text, #ffffff)' }}
                >
                  {submitting ? 'Sending…' : 'Send Order Request'}
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

// ─── Appointment Form Modal ───────────────────────────────────────────────────
const AppointmentFormModal = ({ product, onClose }) => {
  const { tenant } = useTenant();
  const slug   = tenant?.slug;
  const config = tenant?.websiteConfig || {};
  const prices = getEffectivePrices(product);
  const atHomeEnabled = config.appointmentAtHome !== false;

  const [form, setForm] = useState({
    customerName: '',
    mobile: '',
    countryCode: '+91',
    instagram: '',
    preferredDate: '',
    preferredTime: '',
    orderType: 'at_shop',
    address: '',
    descriptionText: '',
  });
  const [descImages, setDescImages]   = useState([]);
  const [errors, setErrors]           = useState({});
  const [submitting, setSubmitting]   = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [duplicate, setDuplicate]     = useState(null);
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
    if (form.orderType === 'at_home' && !form.address.trim())
      errs.address = 'Address is required for home service';
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
    orderType: form.orderType,
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
      const res  = await fetch(`${API_BASE}/public/${slug}/queries`, {
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
      setErrors({ _form: err.message || 'Something went wrong.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!duplicate) return;
    setUpdatingDup(true);
    try {
      const { existingQueryId, pendingBody } = duplicate;
      const res  = await fetch(`${API_BASE}/public/${slug}/queries/${existingQueryId}/update`, {
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

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        style={{ background: 'rgba(0,0,0,0.55)' }}
        onClick={onClose}
      >
        <div
          className="w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[94vh] overflow-y-auto overflow-x-hidden dark:border dark:border-zinc-700"
          style={{ background: 'var(--tenant-card-bg, #ffffff)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4 border-b sticky top-0 z-10 dark:border-zinc-700"
            style={{
              background: 'var(--tenant-card-bg, #ffffff)',
              borderColor: 'color-mix(in srgb, var(--tenant-text, #374151) 10%, transparent)',
            }}
          >
            <div>
              <h3
                className="font-bold text-base dark:text-zinc-100"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--tenant-text, #111827)' }}
              >
                Book Appointment
              </h3>
              {product.nameVisible && (
                <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5 truncate max-w-[260px]">
                  {product.name}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

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
                {/* Price banner */}
                <div
                  className="flex items-center justify-between p-3.5 rounded-2xl"
                  style={{ background: 'color-mix(in srgb, var(--tenant-primary) 8%, transparent)' }}
                >
                  <span className="text-sm font-medium" style={{ color: 'var(--tenant-primary)' }}>
                    {form.orderType === 'at_home' ? 'Home Service Price' : 'At Shop Price'}
                  </span>
                  <span className="text-sm font-bold" style={{ color: 'var(--tenant-primary)' }}>
                    {prices.appointment === 0 ? 'Free' : `₹${prices.appointment}`}
                  </span>
                </div>

                {/* Name */}
                <Field label="Your Name" required error={errors.customerName}>
                  <input
                    type="text"
                    value={form.customerName}
                    onChange={(e) => set('customerName', e.target.value)}
                    placeholder="Full name"
                    className={inputCls}
                    style={inputStyle}
                  />
                </Field>

                {/* WhatsApp */}
                <Field label="WhatsApp Number" required error={errors.mobile}>
                  <div
                    className="flex items-stretch rounded-xl border overflow-hidden h-[46px] dark:border-zinc-600"
                    style={inputStyle}
                  >
                    <CountryCodeDropdown value={form.countryCode} onChange={(v) => set('countryCode', v)} />
                    <input
                      type="tel"
                      value={form.mobile}
                      onChange={(e) => set('mobile', e.target.value.replace(/\D/g, ''))}
                      placeholder="Mobile number"
                      className="flex-1 px-3 text-sm focus:outline-none dark:bg-zinc-800 dark:text-zinc-200 dark:placeholder-zinc-500"
                      style={{ background: 'var(--tenant-card-bg, #ffffff)' }}
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
                    className={inputCls}
                    style={inputStyle}
                  />
                </Field>

                {/* Service location */}
                {atHomeEnabled && (
                  <Field label="Where would you like the service?">
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'at_shop',  label: 'At Shop',  sub: 'You come to us' },
                        { value: 'at_home',  label: 'At Home',  sub: 'We come to you' },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => set('orderType', opt.value)}
                          className="py-3 px-3.5 rounded-2xl text-sm font-semibold border-2 transition-all text-left"
                          style={
                            form.orderType === opt.value
                              ? { borderColor: 'var(--tenant-primary)', color: 'var(--tenant-primary)', background: 'color-mix(in srgb, var(--tenant-primary) 8%, transparent)' }
                              : { borderColor: 'color-mix(in srgb, var(--tenant-text, #374151) 15%, transparent)', color: 'var(--tenant-text, #6b7280)' }
                          }
                        >
                          <div>{opt.label}</div>
                          <div className="text-xs opacity-55 font-normal mt-0.5">{opt.sub}</div>
                        </button>
                      ))}
                    </div>
                  </Field>
                )}

                {/* Address */}
                {form.orderType === 'at_home' && (
                  <Field label="Your Address" required error={errors.address}>
                    <textarea
                      value={form.address}
                      onChange={(e) => set('address', e.target.value)}
                      placeholder="Full address for home service"
                      rows={2}
                      className={`${inputCls} resize-none`}
                      style={inputStyle}
                    />
                  </Field>
                )}

                {/* Date / Time */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Preferred Date (optional)">
                    <input
                      type="date"
                      value={form.preferredDate}
                      min={todayIST()}
                      onChange={(e) => set('preferredDate', e.target.value)}
                      className={inputCls}
                      style={inputStyle}
                    />
                  </Field>
                  <Field label="Preferred Time (optional)">
                    <input
                      type="time"
                      value={form.preferredTime}
                      onChange={(e) => set('preferredTime', e.target.value)}
                      className={inputCls}
                      style={inputStyle}
                    />
                  </Field>
                </div>

                {/* Special requests */}
                <Field label="Special Requests (optional)">
                  <textarea
                    value={form.descriptionText}
                    onChange={(e) => set('descriptionText', e.target.value)}
                    placeholder="Any specific requests…"
                    rows={3}
                    maxLength={500}
                    className={`${inputCls} resize-none`}
                    style={inputStyle}
                  />
                  <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5 text-right">
                    {form.descriptionText.length}/500
                  </p>
                </Field>

                {/* Images */}
                <ImageUploadArea
                  slug={slug}
                  label="Attach Images (optional)"
                  images={descImages}
                  onChange={setDescImages}
                  maxImages={3}
                />

                {errors._form && (
                  <p className="text-sm text-center py-2.5 px-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl">
                    {errors._form}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full py-3.5 rounded-2xl text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ background: 'var(--tenant-primary)', color: 'var(--tenant-btn-text, #ffffff)' }}
                >
                  {submitting ? 'Sending…' : 'Book Appointment'}
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

// ─── Product Detail Modal ─────────────────────────────────────────────────────
const ProductDetailModal = ({ product, onClose }) => {
  const { tenant } = useTenant();
  const [activePhoto, setActivePhoto] = useState(0);
  const [activeForm, setActiveForm]   = useState(null);

  const config = tenant?.websiteConfig || {};
  const prices = getEffectivePrices(product);
  const photos = product.photos || [];

  const productSalesEnabled = config.productSalesEnabled !== false;
const canPickup      = productSalesEnabled && product.deliveryEnabled && prices.offersDelivery;
  const canDelivery    = !!config.deliveryEnabled && product.deliveryEnabled && prices.offersDelivery;
  const canAppointment = !!config.appointmentEnabled && product.appointmentEnabled && prices.offersAppointment;

  const categoryTags = [];
  if (product.categories) {
    product.categories.forEach((cat) => {
      if (cat.values) {
        cat.values.forEach((val) => categoryTags.push({ group: cat.groupName, value: val }));
      }
    });
  }

  if (activeForm === 'delivery')    return <DeliveryFormModal    product={product} onClose={() => setActiveForm(null)} />;
  if (activeForm === 'appointment') return <AppointmentFormModal product={product} onClose={() => setActiveForm(null)} />;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl max-h-[94vh] overflow-y-auto overflow-x-hidden dark:border dark:border-zinc-700"
        style={{ background: 'var(--tenant-card-bg, #ffffff)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b sticky top-0 z-10 dark:border-zinc-700"
          style={{
            background: 'var(--tenant-card-bg, #ffffff)',
            borderColor: 'color-mix(in srgb, var(--tenant-text, #374151) 10%, transparent)',
          }}
        >
          <h3
            className="font-bold text-base dark:text-zinc-100"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--tenant-text, #111827)' }}
          >
            {product.nameVisible ? product.name : 'Product Details'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Photo gallery */}
          {photos.length > 0 && (
            <div className="space-y-2">
              <div className="w-full aspect-square rounded-2xl overflow-hidden bg-gray-50 dark:bg-zinc-800">
                <img
                  src={photos[activePhoto]?.url}
                  alt={product.nameVisible ? product.name : 'Product'}
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
              </div>
              {photos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {photos.map((photo, i) => (
                    <button
                      key={i}
                      onClick={() => setActivePhoto(i)}
                      className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all"
                      style={{
                        borderColor: i === activePhoto ? 'var(--tenant-primary)' : 'transparent',
                        opacity: i === activePhoto ? 1 : 0.6,
                      }}
                    >
                      <img src={photo.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {product.description && (
            <p className="text-sm leading-relaxed dark:text-zinc-400" style={{ color: 'var(--tenant-text, #6b7280)' }}>
              {product.description}
            </p>
          )}

          {/* Prices */}
          <div className="space-y-2">
            {canPickup && (
              <div
                className="flex items-center justify-between p-4 rounded-2xl dark:border dark:border-zinc-700"
                style={{ background: 'color-mix(in srgb, var(--tenant-bg, #fafaf9) 60%, var(--tenant-card-bg, #fff))' }}
              >
                <div>
                  <p className="text-xs text-gray-400 dark:text-zinc-500 mb-1">
                    {canDelivery ? 'Price' : 'Price'}
                  </p>
                  <div className="flex items-center gap-2">
                    {prices.hasDiscount && (
                      <span className="text-gray-400 dark:text-zinc-500 line-through text-sm">
                        ₹{prices.originalDelivery}
                      </span>
                    )}
                    <span
                      className="font-bold text-lg"
                      style={{ color: 'var(--tenant-text, #111827)' }}
                    >
                      {prices.delivery === 0 ? 'Free' : `₹${prices.delivery}`}
                    </span>
                    {prices.hasDiscount && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-semibold text-white"
                        style={{ background: 'var(--tenant-accent)' }}
                      >
                        {prices.discountLabel}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {canAppointment && (
              <div
                className="flex items-center justify-between p-4 rounded-2xl dark:border dark:border-zinc-700"
                style={{ background: 'color-mix(in srgb, var(--tenant-bg, #fafaf9) 60%, var(--tenant-card-bg, #fff))' }}
              >
                <div>
                  <p className="text-xs text-gray-400 dark:text-zinc-500 mb-1">Appointment Price</p>
                  <div className="flex items-center gap-2">
                    {prices.hasDiscount && (
                      <span className="text-gray-400 dark:text-zinc-500 line-through text-sm">
                        ₹{prices.originalAppointment}
                      </span>
                    )}
                    <span
                      className="font-bold text-lg"
                      style={{ color: 'var(--tenant-text, #111827)' }}
                    >
                      {prices.appointment === 0 ? 'Free' : `₹${prices.appointment}`}
                    </span>
                    {prices.hasDiscount && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-semibold text-white"
                        style={{ background: 'var(--tenant-accent)' }}
                      >
                        {prices.discountLabel}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Category tags */}
          {categoryTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {categoryTags.map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                  style={{
                    background: 'color-mix(in srgb, var(--tenant-primary) 10%, transparent)',
                    color: 'var(--tenant-primary)',
                  }}
                >
                  <Tag size={10} />
                  {tag.value}
                </span>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-1">
            {canPickup && (
              <button
                className="flex-1 py-3.5 rounded-2xl text-sm font-bold transition-opacity hover:opacity-90"
                style={{ background: 'var(--tenant-primary)', color: 'var(--tenant-btn-text, #ffffff)' }}
                onClick={() => setActiveForm('delivery')}
              >
                {canDelivery ? 'Buy' : 'Buy'}
              </button>
            )}
            {canAppointment && (
              <button
                className="flex-1 py-3.5 rounded-2xl text-sm font-bold transition-colors border-2"
                style={{
                  color: 'var(--tenant-primary)',
                  borderColor: 'var(--tenant-primary)',
                  background: 'color-mix(in srgb, var(--tenant-primary) 8%, transparent)',
                }}
                onClick={() => setActiveForm('appointment')}
              >
                Book Appointment
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;