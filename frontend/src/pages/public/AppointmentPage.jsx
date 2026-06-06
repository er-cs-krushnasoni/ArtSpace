import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import ShopHeader from '../../components/public/ShopHeader';
import CountryCodeDropdown from '../../components/public/CountryCodeDropdown';
import ImageUploadArea from '../../components/public/ImageUploadArea';
import DuplicateDialog from '../../components/public/DuplicateDialog';
import OrderConfirmation from '../../components/public/OrderConfirmation';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const todayIST = () => {
  const now = new Date();
  const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  return ist.toISOString().split('T')[0];
};

const Field = ({ label, required, error, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{error}</p>}
  </div>
);

const inputClass =
  'w-full px-3.5 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none transition-colors';

const AppointmentPage = () => {
  const { slug } = useParams();
  const { tenant, labels } = useTenant();
  const config = tenant?.websiteConfig || {};

  const atHomeEnabled = config.appointmentAtHome !== false;
  const defaultOrderType = 'at_shop';

  const [form, setForm] = useState({
    customerName: '',
    mobile: '',
    countryCode: '+91',
    instagram: '',
    preferredDate: '',
    preferredTime: '',
    orderType: defaultOrderType,
    address: '',
    descriptionText: '',
  });

  const [refImages, setRefImages] = useState([]);
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
    if (refImages.length < 1)
      errs.refImages = 'Please upload at least one reference image';
    if (form.orderType === 'at_home' && !form.address.trim())
      errs.address = 'Address is required for home service';
    return errs;
  };

  const buildBody = () => ({
    type: 'APPOINTMENT',
    customerName: form.customerName.trim(),
    mobile: form.mobile.replace(/\s+/g, ''),
    countryCode: form.countryCode,
    instagram: form.instagram.trim(),
    preferredDate: form.preferredDate || undefined,
    preferredTime: form.preferredTime || undefined,
    orderType: form.orderType,
    address: form.address.trim(),
    referenceImages: refImages.map((i) => i.secure_url),
    descriptionImages: [],
    descriptionText: form.descriptionText.trim(),
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

  const showAddress = form.orderType === 'at_home';

  return (
    <div className="min-h-screen" style={{ background: 'var(--tenant-bg)' }}>
      <ShopHeader />

      <div className="max-w-lg mx-auto px-4 py-10 sm:py-14">
        {/* Page heading */}
        <div className="mb-7 flex items-start gap-4">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: 'color-mix(in srgb, var(--tenant-primary) 12%, transparent)' }}
          >
            <CalendarDays size={20} style={{ color: 'var(--tenant-primary)' }} />
          </div>
          <div>
            <h1
              className="text-2xl sm:text-3xl font-bold"
style={{ 
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  color: 'var(--tenant-nav-text, #1c1917)'
}}
            >
              {labels.book_appointment || 'Book Appointment'}
            </h1>
            <p className="text-sm mt-1"
style={{ color: 'color-mix(in srgb, var(--tenant-nav-text, #1c1917) 55%, transparent)' }}>
              Share your reference and we'll confirm shortly
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-md p-6 sm:p-8">
            <OrderConfirmation
              shopName={tenant?.businessName}
              whatsapp={config.whatsapp}
              instagram={config.instagram}
              onClose={() => setSubmitted(false)}
            />
          </div>
        ) : (
          <div
            className="bg-white dark:bg-zinc-900 rounded-3xl shadow-md p-5 sm:p-8 space-y-4"
            style={{ animation: 'formFadeUp 0.3s ease both' }}
          >
            {/* Name */}
            <Field label="Your Name" required error={errors.customerName}>
              <input
                type="text"
                value={form.customerName}
                onChange={(e) => set('customerName', e.target.value)}
                placeholder="Full name"
                className={inputClass}
              />
            </Field>

            {/* Mobile */}
            <Field label="WhatsApp Number" required error={errors.mobile}>
              <div className="flex items-stretch rounded-xl border border-gray-200 dark:border-zinc-700 h-[46px] bg-white dark:bg-zinc-800 overflow-hidden">
                <CountryCodeDropdown
                  value={form.countryCode}
                  onChange={(v) => set('countryCode', v)}
                />
                <input
                  type="tel"
                  value={form.mobile}
                  onChange={(e) => set('mobile', e.target.value.replace(/\D/g, ''))}
                  placeholder="Mobile number"
                  inputMode="numeric"
                  className="flex-1 px-3 text-sm focus:outline-none bg-transparent text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500"
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
                className={inputClass}
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
                  className={inputClass}
                />
              </Field>
              <Field label="Preferred Time (optional)">
                <input
                  type="time"
                  value={form.preferredTime}
                  onChange={(e) => set('preferredTime', e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>

            {/* Service Location */}
            {atHomeEnabled && (
              <Field label="Where would you like the service?" error={errors.orderType}>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'at_shop', label: 'At Shop', sub: 'You come to us' },
                    { value: 'at_home', label: 'At Home', sub: 'We come to you' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => set('orderType', opt.value)}
                      className="py-3 px-3.5 rounded-2xl text-sm font-medium border-2 transition-all text-left"
                      style={
                        form.orderType === opt.value
                          ? {
                              borderColor: 'var(--tenant-primary)',
                              color: 'var(--tenant-primary)',
                              background: 'color-mix(in srgb, var(--tenant-primary) 10%, transparent)',
                            }
                          : { borderColor: '#e5e7eb', color: '#6b7280' }
                      }
                    >
                      <div className="font-semibold">{opt.label}</div>
                      <div className="text-xs opacity-60 font-normal mt-0.5">{opt.sub}</div>
                    </button>
                  ))}
                </div>
              </Field>
            )}

            {/* Address */}
            {showAddress && (
              <Field label="Your Address" required error={errors.address}>
                <textarea
                  value={form.address}
                  onChange={(e) => set('address', e.target.value)}
                  placeholder="Full address for home service"
                  rows={2}
                  className="w-full px-3.5 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none transition-colors resize-none"
                />
              </Field>
            )}

            {/* Reference images */}
            <ImageUploadArea
              slug={slug}
              label="Reference Images"
              images={refImages}
              onChange={setRefImages}
              maxImages={3}
              required
              error={errors.refImages}
            />

            {/* Description */}
            <Field label="Additional Notes (optional)">
              <textarea
                value={form.descriptionText}
                onChange={(e) => set('descriptionText', e.target.value)}
                placeholder="Any specific requests or information…"
                rows={3}
                maxLength={500}
                className="w-full px-3.5 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none transition-colors resize-none"
              />
              <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5 text-right">
                {form.descriptionText.length}/500
              </p>
            </Field>

            {errors._form && (
              <p className="text-sm text-center py-2.5 px-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl">
                {errors._form}
              </p>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-3.5 rounded-2xl text-base font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{
                background: 'var(--tenant-primary)',
                color: 'var(--tenant-btn-text, #ffffff)',
              }}
            >
              {submitting ? 'Sending…' : 'Book Appointment'}
            </button>
          </div>
        )}
      </div>

      {duplicate && (
        <DuplicateDialog
          shopName={tenant?.businessName}
          onUpdate={handleUpdate}
          onCancel={handleKeepExisting}
          isUpdating={updatingDup}
        />
      )}

      <style>{`
        @keyframes formFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AppointmentPage;