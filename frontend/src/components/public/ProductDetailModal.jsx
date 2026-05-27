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

// ─── Delivery Form Modal ──────────────────────────────────────────────────────
const DeliveryFormModal = ({ product, onClose }) => {
  const { tenant } = useTenant();
  const slug = tenant?.slug;
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

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        style={{ background: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      >
        <div
          className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto overflow-x-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
            <div>
              <h3 className="font-semibold text-gray-900 text-base" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Order / Delivery
              </h3>
              {product.nameVisible && (
                <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[260px]">{product.name}</p>
              )}
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
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
                {/* Price info */}
                <div
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: 'color-mix(in srgb, var(--tenant-primary) 8%, transparent)' }}
                >
                  <span className="text-sm font-medium" style={{ color: 'var(--tenant-primary)' }}>
                    {form.orderType === 'delivery' ? 'Delivery Price' : 'Pickup Price'}
                  </span>
                  <span className="text-sm font-bold" style={{ color: 'var(--tenant-primary)' }}>
                    {prices.delivery === 0 ? 'Free' : `₹${prices.delivery}`}
                  </span>
                </div>

                {/* 1. Name */}
                <Field label="Your Name" required error={errors.customerName}>
                  <input
                    type="text"
                    value={form.customerName}
                    onChange={(e) => set('customerName', e.target.value)}
                    placeholder="Full name"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400 transition-colors"
                  />
                </Field>

                {/* 2. WhatsApp */}
                <Field label="WhatsApp Number" required error={errors.mobile}>
                  <div className="flex items-stretch rounded-lg border border-gray-200 h-[42px]">
                    <CountryCodeDropdown value={form.countryCode} onChange={(v) => set('countryCode', v)} />
                    <input
                      type="tel"
                      value={form.mobile}
                      onChange={(e) => set('mobile', e.target.value.replace(/\D/g, ''))}
                      placeholder="Mobile number"
                      className="flex-1 px-3 text-sm focus:outline-none bg-white rounded-r-lg"
                    />
                  </div>
                </Field>

                {/* 3. Instagram */}
                <Field label="Instagram (optional)">
                  <input
                    type="text"
                    value={form.instagram}
                    onChange={(e) => set('instagram', e.target.value)}
                    placeholder="@handle"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400 transition-colors"
                  />
                </Field>

                {/* 4. Order type: Delivery / Pickup */}
                <Field label="How would you like it?">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'pickup', label: 'Pickup', sub: 'You collect from us' },
                      { value: 'delivery', label: 'Delivery', sub: 'We deliver to you' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => set('orderType', opt.value)}
                        className="py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-all text-left"
                        style={
                          form.orderType === opt.value
                            ? { borderColor: 'var(--tenant-primary)', color: 'var(--tenant-primary)', background: 'color-mix(in srgb, var(--tenant-primary) 8%, transparent)' }
                            : { borderColor: '#e5e7eb', color: '#4b5563' }
                        }
                      >
                        <div>{opt.label}</div>
                        <div className="text-xs opacity-60 font-normal mt-0.5">{opt.sub}</div>
                      </button>
                    ))}
                  </div>
                </Field>

                {/* 5. Address — only for delivery */}
                {form.orderType === 'delivery' && (
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

                {/* 6. Tutorial video — only for delivery */}
                {form.orderType === 'delivery' && config.tutorialVideoUrl && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1.5">Watch before ordering</p>
                    <video src={config.tutorialVideoUrl} controls className="w-full rounded-xl bg-black" style={{ maxHeight: '200px' }} />
                  </div>
                )}

                {/* 7. Date / Time */}
                <div className="grid grid-cols-2 gap-3 min-w-0">
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

                {/* 8. Special Requests */}
                <Field label="Special Requests (optional)">
                  <textarea
                    value={form.descriptionText}
                    onChange={(e) => set('descriptionText', e.target.value)}
                    placeholder="Any specific instructions…"
                    rows={3}
                    maxLength={500}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400 transition-colors resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-0.5 text-right">{form.descriptionText.length}/500</p>
                </Field>

                {/* 9. Images */}
                <ImageUploadArea slug={slug} label="Attach Images (optional)" images={descImages} onChange={setDescImages} maxImages={3} />

                {errors._form && (
                  <p className="text-sm text-center py-2 px-3 bg-red-50 text-red-600 rounded-lg">{errors._form}</p>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full py-3 rounded-xl text-sm font-semibold  transition-opacity hover:opacity-90 disabled:opacity-60"
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
  const slug = tenant?.slug;
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

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        style={{ background: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      >
        <div
          className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto overflow-x-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
            <div>
              <h3 className="font-semibold text-gray-900 text-base" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Book Appointment
              </h3>
              {product.nameVisible && (
                <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[260px]">{product.name}</p>
              )}
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
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
                {/* Price info */}
                <div
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: 'color-mix(in srgb, var(--tenant-primary) 8%, transparent)' }}
                >
                  <span className="text-sm font-medium" style={{ color: 'var(--tenant-primary)' }}>
                    {form.orderType === 'at_home' ? 'Home Service Price' : 'At Shop Price'}
                  </span>
                  <span className="text-sm font-bold" style={{ color: 'var(--tenant-primary)' }}>
                    {prices.appointment === 0 ? 'Free' : `₹${prices.appointment}`}
                  </span>
                </div>

                {/* 1. Name */}
                <Field label="Your Name" required error={errors.customerName}>
                  <input
                    type="text"
                    value={form.customerName}
                    onChange={(e) => set('customerName', e.target.value)}
                    placeholder="Full name"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400 transition-colors"
                  />
                </Field>

                {/* 2. WhatsApp */}
                <Field label="WhatsApp Number" required error={errors.mobile}>
                  <div className="flex items-stretch rounded-lg border border-gray-200 h-[42px]">
                    <CountryCodeDropdown value={form.countryCode} onChange={(v) => set('countryCode', v)} />
                    <input
                      type="tel"
                      value={form.mobile}
                      onChange={(e) => set('mobile', e.target.value.replace(/\D/g, ''))}
                      placeholder="Mobile number"
                      className="flex-1 px-3 text-sm focus:outline-none bg-white rounded-r-lg"
                    />
                  </div>
                </Field>

                {/* 3. Instagram */}
                <Field label="Instagram (optional)">
                  <input
                    type="text"
                    value={form.instagram}
                    onChange={(e) => set('instagram', e.target.value)}
                    placeholder="@handle"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400 transition-colors"
                  />
                </Field>

                {/* 4. Service location — only if atHomeEnabled */}
                {atHomeEnabled && (
                  <Field label="Where would you like the service?">
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'at_shop', label: 'At Shop', sub: 'You come to us' },
                        { value: 'at_home', label: 'At Home', sub: 'We come to you' },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => set('orderType', opt.value)}
                          className="py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-all text-left"
                          style={
                            form.orderType === opt.value
                              ? { borderColor: 'var(--tenant-primary)', color: 'var(--tenant-primary)', background: 'color-mix(in srgb, var(--tenant-primary) 8%, transparent)' }
                              : { borderColor: '#e5e7eb', color: '#4b5563' }
                          }
                        >
                          <div>{opt.label}</div>
                          <div className="text-xs opacity-60 font-normal mt-0.5">{opt.sub}</div>
                        </button>
                      ))}
                    </div>
                  </Field>
                )}

                {/* 5. Address — only for at_home */}
                {form.orderType === 'at_home' && (
                  <Field label="Your Address" required error={errors.address}>
                    <textarea
                      value={form.address}
                      onChange={(e) => set('address', e.target.value)}
                      placeholder="Full address for home service"
                      rows={2}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400 transition-colors resize-none"
                    />
                  </Field>
                )}

                {/* 6. Date / Time */}
                <div className="grid grid-cols-2 gap-3 min-w-0">
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

                {/* 7. Special Requests */}
                <Field label="Special Requests (optional)">
                  <textarea
                    value={form.descriptionText}
                    onChange={(e) => set('descriptionText', e.target.value)}
                    placeholder="Any specific requests…"
                    rows={3}
                    maxLength={500}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400 transition-colors resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-0.5 text-right">{form.descriptionText.length}/500</p>
                </Field>

                {/* 8. Images */}
                <ImageUploadArea slug={slug} label="Attach Images (optional)" images={descImages} onChange={setDescImages} maxImages={3} />

                {errors._form && (
                  <p className="text-sm text-center py-2 px-3 bg-red-50 text-red-600 rounded-lg">{errors._form}</p>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full py-3 rounded-xl text-sm font-semibold  transition-opacity hover:opacity-90 disabled:opacity-60"
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
  const [activeForm, setActiveForm] = useState(null); // null | 'delivery' | 'appointment'
  const config = tenant?.websiteConfig || {};
  const prices = getEffectivePrices(product);
  const photos = product.photos || [];
  const canDelivery = !!config.deliveryEnabled && product.deliveryEnabled && prices.offersDelivery;
  const canAppointment = !!config.appointmentEnabled && product.appointmentEnabled && prices.offersAppointment;

  const categoryTags = [];
  if (product.categories) {
    product.categories.forEach((cat) => {
      if (cat.values) {
        cat.values.forEach((val) => categoryTags.push({ group: cat.groupName, value: val }));
      }
    });
  }

  if (activeForm === 'delivery') return <DeliveryFormModal product={product} onClose={() => setActiveForm(null)} />;
  if (activeForm === 'appointment') return <AppointmentFormModal product={product} onClose={() => setActiveForm(null)} />;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto overflow-x-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="font-semibold text-gray-900 text-base" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {product.nameVisible ? product.name : 'Product Details'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Photo gallery */}
          {photos.length > 0 && (
            <div className="space-y-2">
              <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-50">
                <img src={photos[activePhoto]?.url} alt={product.nameVisible ? product.name : 'Product'} className="w-full h-full object-cover" />
              </div>
              {photos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {photos.map((photo, i) => (
                    <button
                      key={i}
                      onClick={() => setActivePhoto(i)}
                      className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all"
                      style={{ borderColor: i === activePhoto ? 'var(--tenant-primary)' : 'transparent' }}
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
            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
          )}

          {/* Prices */}
          <div className="space-y-2">
            {canDelivery && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Delivery / Pickup Price</p>
                  <div className="flex items-center gap-2">
                    {prices.hasDiscount && <span className="text-gray-400 line-through text-sm">₹{prices.originalDelivery}</span>}
                    <span className="font-semibold text-gray-900">{prices.delivery === 0 ? 'Free' : `₹${prices.delivery}`}</span>
                    {prices.hasDiscount && <span className="bg-red-500  text-xs px-2 py-0.5 rounded-full">{prices.discountLabel}</span>}
                  </div>
                </div>
              </div>
            )}
            {canAppointment && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Appointment Price</p>
                  <div className="flex items-center gap-2">
                    {prices.hasDiscount && <span className="text-gray-400 line-through text-sm">₹{prices.originalAppointment}</span>}
                    <span className="font-semibold text-gray-900">{prices.appointment === 0 ? 'Free' : `₹${prices.appointment}`}</span>
                    {prices.hasDiscount && <span className="bg-red-500  text-xs px-2 py-0.5 rounded-full">{prices.discountLabel}</span>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Category tags */}
          {categoryTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {categoryTags.map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{ background: 'color-mix(in srgb, var(--tenant-primary) 12%, transparent)', color: 'var(--tenant-primary)' }}
                >
                  <Tag size={10} />
                  {tag.value}
                </span>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-1">
            {canDelivery && (
              <button
                className="flex-1 py-3 rounded-xl text-sm font-semibold  transition-opacity hover:opacity-90"
                style={{ background: 'var(--tenant-primary)', color: 'var(--tenant-btn-text, #ffffff)' }}
                onClick={() => setActiveForm('delivery')}
              >
                Order / Delivery
              </button>
            )}
            {canAppointment && (
              <button
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition-colors border-2"
                style={{ color: 'var(--tenant-primary)', borderColor: 'var(--tenant-primary)', background: 'color-mix(in srgb, var(--tenant-primary) 8%, transparent)' }}
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