import { useState } from 'react';
import { Save } from 'lucide-react';
import api from '../../../api/axiosInstance';
import toast from 'react-hot-toast';

export default function GeneralSettingsSection({ initialData, onSaved }) {
  const [form, setForm] = useState({
    businessName: initialData?.businessName || '',
    address: initialData?.websiteConfig?.address || '',
    whatsapp: initialData?.websiteConfig?.whatsapp || '',
    instagram: initialData?.websiteConfig?.instagram || '',
    primaryColor: initialData?.websiteConfig?.primaryColor || '#8b5cf6',
    accentColor: initialData?.websiteConfig?.accentColor || '#ec4899',
    bgColor:      initialData?.websiteConfig?.bgColor      || '#ffffff',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async () => {
    if (!form.businessName.trim()) {
      toast.error('Business name is required');
      return;
    }
    setSaving(true);
    try {
      await api.put('/tenant/settings/general', form);
      // Apply colors live
      document.documentElement.style.setProperty('--tenant-primary', form.primaryColor);
      document.documentElement.style.setProperty('--tenant-accent', form.accentColor);
      document.documentElement.style.setProperty('--tenant-bg', form.bgColor);
      toast.success('Settings saved');
      onSaved?.({ ...form });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-5">General Info</h2>

      <div className="space-y-4">
        {/* Business Name */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Business Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={form.businessName}
            onChange={(e) => handleChange('businessName', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all"
            placeholder="e.g. Glamour Nails Studio"
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Address</label>
          <textarea
            value={form.address}
            onChange={(e) => handleChange('address', e.target.value)}
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all resize-none"
            placeholder="Your full shop address"
          />
        </div>

        {/* Socials row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">WhatsApp Number</label>
            <input
              type="text"
              value={form.whatsapp}
              onChange={(e) => handleChange('whatsapp', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all"
              placeholder="+91 98765 43210"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Instagram Handle</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
              <input
                type="text"
                value={form.instagram}
                onChange={(e) => handleChange('instagram', e.target.value.replace(/^@/, ''))}
                className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all"
                placeholder="yourhandle"
              />
            </div>
          </div>
        </div>

        {/* Colors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ColorInput
            label="Primary Color"
            value={form.primaryColor}
            onChange={(v) => handleChange('primaryColor', v)}
          />
          <ColorInput
            label="Accent Color"
            value={form.accentColor}
            onChange={(v) => handleChange('accentColor', v)}
          />
            <ColorInput label="Background Color" value={form.bgColor}      onChange={(v) => handleChange('bgColor', v)} />

        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-200 disabled:opacity-60"
          style={{ background: 'var(--color-primary, #8b5cf6)' }}
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

function ColorInput({ label, value, onChange }) {
  const [hex, setHex] = useState(value);

  const handleHexChange = (raw) => {
    setHex(raw);
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(raw)) {
      onChange(raw);
    }
  };

  const handlePickerChange = (e) => {
    setHex(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={handlePickerChange}
            className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5"
          />
        </div>
        <input
          type="text"
          value={hex}
          onChange={(e) => handleHexChange(e.target.value)}
          maxLength={7}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all"
          placeholder="#8b5cf6"
        />
        <div
          className="w-9 h-9 rounded-lg border border-gray-200 flex-shrink-0"
          style={{ background: value }}
        />
      </div>
    </div>
  );
}