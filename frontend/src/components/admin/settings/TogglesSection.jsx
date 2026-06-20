import { useState } from 'react';
import api from '../../../api/axiosInstance';
import toast from 'react-hot-toast';

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/30 disabled:opacity-50 ${
        checked ? 'bg-violet-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

const BASE_TOGGLES = [
  { key: 'shopVisible',        label: 'Public Shop Visible',   desc: 'When off, your shop shows "temporarily unavailable" to customers' },
  { key: 'sliderEnabled',      label: 'Hero Slider',           desc: 'Show image slideshow at top of public site' },
  { key: 'quizEnabled',        label: 'Style Quiz',            desc: 'Let customers take a quiz to find products' },
  { key: 'faqEnabled',         label: 'FAQ Section',           desc: 'Show a FAQ section on your public site' },
  { key: 'blogEnabled',        label: 'Blog',                  desc: 'Publish articles visible on your public site' },
  { key: 'productSalesEnabled',label: 'Product Sales',         desc: 'Sell pre-made or custom products. Customers can still browse when off.' },
  { key: 'appointmentEnabled', label: 'Appointment Booking',   desc: 'Allow customers to book appointments' },
];

export default function TogglesSection({ initialData, onSaved }) {
  const cfg = initialData?.websiteConfig || {};
  const [toggles, setToggles] = useState({
    shopVisible:         cfg.shopVisible !== false,
    sliderEnabled:       cfg.sliderEnabled ?? false,
    quizEnabled:         cfg.quizEnabled ?? false,
    faqEnabled:          cfg.faqEnabled ?? false,
    blogEnabled:         cfg.blogEnabled ?? false,
    productSalesEnabled: cfg.productSalesEnabled !== false,
    deliveryEnabled:     cfg.deliveryEnabled ?? false,
    appointmentEnabled:  cfg.appointmentEnabled ?? true,
    appointmentAtHome:   cfg.appointmentAtHome ?? true,
  });
  const [saving, setSaving] = useState(null);

  const handleToggle = async (key, value) => {
    // At-least-one guard
    if (key === 'productSalesEnabled' && !value && !toggles.appointmentEnabled) {
      toast.error('At least one service (Product Sales or Appointment) must be enabled');
      return;
    }
    if (key === 'appointmentEnabled' && !value && !toggles.productSalesEnabled) {
      toast.error('At least one service (Product Sales or Appointment) must be enabled');
      return;
    }

    const optimistic = { ...toggles, [key]: value };
    setToggles(optimistic);
    setSaving(key);
    try {
      await api.put('/tenant/settings/toggles', { [key]: value });
      onSaved?.(optimistic);
    } catch (err) {
      setToggles({ ...toggles });
      toast.error(err.response?.data?.message || 'Failed to update setting');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-1">Site Sections</h2>
      <p className="text-xs text-gray-400 mb-5">Changes save instantly</p>
      <div className="space-y-4">
        {BASE_TOGGLES.map(({ key, label, desc }) => (
          <div key={key}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
              <div className="flex-shrink-0 pt-0.5">
                <Toggle
                  checked={toggles[key]}
                  onChange={(val) => handleToggle(key, val)}
                  disabled={saving === key}
                />
              </div>
            </div>

            {/* Home Delivery sub-toggle under Product Sales */}
            {key === 'productSalesEnabled' && toggles.productSalesEnabled && (
              <div className="mt-3 ml-2 pl-3 border-l-2 border-gray-100">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-700 leading-snug">Home Delivery</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Allow delivery to customer's address via courier or parcel. Pickup is always available.
                    </p>
                  </div>
                  <div className="flex-shrink-0 pt-0.5">
                    <Toggle
                      checked={toggles.deliveryEnabled}
                      onChange={(val) => handleToggle('deliveryEnabled', val)}
                      disabled={saving === 'deliveryEnabled'}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Home Service sub-toggle under Appointment Booking */}
            {key === 'appointmentEnabled' && toggles.appointmentEnabled && (
              <div className="mt-3 ml-2 pl-3 border-l-2 border-gray-100">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-700 leading-snug">
                      Home Service
                      <span className="hidden sm:inline"> (Artist Visits Customer)</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      When on, customers see "At Home" option. When off, only "At Shop" is shown.
                    </p>
                  </div>
                  <div className="flex-shrink-0 pt-0.5">
                    <Toggle
                      checked={toggles.appointmentAtHome}
                      onChange={(val) => handleToggle('appointmentAtHome', val)}
                      disabled={saving === 'appointmentAtHome'}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}