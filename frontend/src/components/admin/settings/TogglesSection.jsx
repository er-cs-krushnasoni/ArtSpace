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

const TOGGLES = [
  { key: 'sliderEnabled', label: 'Hero Slider', desc: 'Show image slideshow at top of public site' },
  { key: 'quizEnabled', label: 'Style Quiz', desc: 'Let customers take a quiz to find products' },
  { key: 'blogEnabled', label: 'Blog', desc: 'Publish articles visible on your public site' },
  { key: 'deliveryEnabled', label: 'Delivery / Pickup', desc: 'Allow delivery and pickup orders' },
  { key: 'appointmentEnabled', label: 'Appointment Booking', desc: 'Allow customers to book appointments' },
];

export default function TogglesSection({ initialData, onSaved }) {
  const cfg = initialData?.websiteConfig || {};
  const [toggles, setToggles] = useState({
    sliderEnabled: cfg.sliderEnabled ?? false,
    quizEnabled: cfg.quizEnabled ?? false,
    blogEnabled: cfg.blogEnabled ?? false,
    deliveryEnabled: cfg.deliveryEnabled ?? true,
    appointmentEnabled: cfg.appointmentEnabled ?? true,
  });
  const [saving, setSaving] = useState(null);

  const handleToggle = async (key, value) => {
    const optimistic = { ...toggles, [key]: value };
    setToggles(optimistic);
    setSaving(key);

    try {
      await api.put('/tenant/settings/toggles', { [key]: value });
      onSaved?.(optimistic);
    } catch (err) {
      // Revert on failure
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
        {TOGGLES.map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-800">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </div>
            <Toggle
              checked={toggles[key]}
              onChange={(val) => handleToggle(key, val)}
              disabled={saving === key}
            />
          </div>
        ))}
      </div>
    </div>
  );
}