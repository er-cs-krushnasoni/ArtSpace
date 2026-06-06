import { useState } from 'react';
import { Save, Sun, Moon, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../../api/axiosInstance';
import toast from 'react-hot-toast';

const DEFAULT_COLORS = {
  primaryColor: '#7c3aed',
  accentColor:  '#f59e0b',
  bgColor:      '#fafaf9',
  navBg:        '',
  navText:      '',
  cardBg:       '',
  btnText:      '',
};

export default function GeneralSettingsSection({ initialData, onSaved }) {
  const [form, setForm] = useState({
    businessName: initialData?.businessName || '',
    address:      initialData?.websiteConfig?.address      || '',
    whatsapp:     initialData?.websiteConfig?.whatsapp     || '',
    instagram:    initialData?.websiteConfig?.instagram    || '',
    primaryColor: initialData?.websiteConfig?.primaryColor || DEFAULT_COLORS.primaryColor,
    accentColor:  initialData?.websiteConfig?.accentColor  || DEFAULT_COLORS.accentColor,
    bgColor:      initialData?.websiteConfig?.bgColor      || DEFAULT_COLORS.bgColor,
    navBg:        initialData?.websiteConfig?.navBg        || '',
    navText:      initialData?.websiteConfig?.navText      || '',
    cardBg:       initialData?.websiteConfig?.cardBg       || '',
    btnText:      initialData?.websiteConfig?.btnText      || '',
  });

  const [publicTheme,    setPublicTheme]    = useState(initialData?.websiteConfig?.publicTheme || 'light');
  const [savingTheme,    setSavingTheme]    = useState(false);
  const [saving,         setSaving]         = useState(false);
  const [advancedOpen,   setAdvancedOpen]   = useState(false);

  const handleChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  // ── Theme toggle ────────────────────────────────────────────────────────
const handleThemeToggle = async (theme) => {
    if (theme === publicTheme) return;
    setSavingTheme(true);
    try {
      await api.put('/tenant/settings/toggles', { publicTheme: theme });
      setPublicTheme(theme);
      // Apply immediately so the page reflects the change without a reload
      document.documentElement.setAttribute('data-theme', theme);
      toast.success(`Theme set to ${theme === 'dark' ? '🌙 Dark' : '☀️ Light'}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update theme');
    } finally {
      setSavingTheme(false);
    }
  };

  // ── Reset colors ────────────────────────────────────────────────────────
  const handleResetColors = () => {
    setForm((f) => ({ ...f, ...DEFAULT_COLORS }));
    document.documentElement.style.setProperty('--tenant-primary', DEFAULT_COLORS.primaryColor);
    document.documentElement.style.setProperty('--tenant-accent',  DEFAULT_COLORS.accentColor);
    document.documentElement.style.setProperty('--tenant-bg',      DEFAULT_COLORS.bgColor);
    document.documentElement.style.removeProperty('--tenant-nav-bg');
    document.documentElement.style.removeProperty('--tenant-nav-text');
    document.documentElement.style.removeProperty('--tenant-card-bg');
    document.documentElement.style.removeProperty('--tenant-btn-text');
  };

  // ── Save general settings ───────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.businessName.trim()) {
      toast.error('Business name is required');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form };
// Don't persist default bgColor — keeps it nullable so dark theme CSS can control it
if (payload.bgColor === DEFAULT_COLORS.bgColor) payload.bgColor = '';
await api.put('/tenant/settings/general', payload);
      document.documentElement.style.setProperty('--tenant-primary', form.primaryColor);
      document.documentElement.style.setProperty('--tenant-accent',  form.accentColor);
      document.documentElement.style.setProperty('--tenant-bg',      form.bgColor);
      ['navBg|--tenant-nav-bg', 'navText|--tenant-nav-text', 'cardBg|--tenant-card-bg', 'btnText|--tenant-btn-text'].forEach((pair) => {
  const [field, cssVar] = pair.split('|');
  if (form[field]) document.documentElement.style.setProperty(cssVar, form[field]);
  else document.documentElement.style.removeProperty(cssVar);
});
      toast.success('Settings saved');
      onSaved?.({ ...form });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100">

      {/* ── Appearance / Theme ──────────────────────────────────────────── */}
      <div className="p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-0.5">Appearance</h2>
        <p className="text-xs text-gray-400 mb-5">Controls the theme for all shop visitors</p>

        {/* Theme pill toggle */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center p-1 rounded-xl bg-gray-100 gap-1">
            <button
              type="button"
              onClick={() => handleThemeToggle('light')}
              disabled={savingTheme}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-60"
              style={
                publicTheme === 'light'
                  ? { background: '#ffffff', color: '#1c1917', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                  : { background: 'transparent', color: '#6b7280' }
              }
            >
              <Sun className="w-4 h-4" />
              Light
            </button>
            <button
              type="button"
              onClick={() => handleThemeToggle('dark')}
              disabled={savingTheme}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-60"
              style={
                publicTheme === 'dark'
                  ? { background: '#18181b', color: '#f4f4f5', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }
                  : { background: 'transparent', color: '#6b7280' }
              }
            >
              <Moon className="w-4 h-4" />
              Dark
            </button>
          </div>
          {savingTheme && (
            <span className="text-xs text-gray-400">Saving…</span>
          )}
        </div>
      </div>

      {/* ── General Info ────────────────────────────────────────────────── */}
      <div className="p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-5">General Info</h2>
        <div className="space-y-4">

          {/* Business Name */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Business Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.businessName}
              onChange={(e) => handleChange('businessName', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all"
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
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all resize-none"
              placeholder="Your full shop address"
            />
          </div>

          {/* Socials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">WhatsApp Number</label>
              <input
                type="text"
                value={form.whatsapp}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all"
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
                  className="w-full border border-gray-200 rounded-xl pl-7 pr-3 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all"
                  placeholder="yourhandle"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Brand Colors ────────────────────────────────────────────────── */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Brand Colors</h2>
            <p className="text-xs text-gray-400 mt-0.5">These drive your shop's look and feel</p>
          </div>
          <button
            type="button"
            onClick={handleResetColors}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            Reset to defaults
          </button>
        </div>

        {/* Primary 3 colors in a row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <ColorInput
            label="Primary Color"
            hint="Buttons, links, active states"
            value={form.primaryColor}
            onChange={(v) => handleChange('primaryColor', v)}
          />
          <ColorInput
            label="Accent Color"
            hint="Prices, badges, highlights"
            value={form.accentColor}
            onChange={(v) => handleChange('accentColor', v)}
          />
          <ColorInput
            label="Page Background"
            hint="Main page background"
            value={form.bgColor}
            onChange={(v) => handleChange('bgColor', v)}
          />
        </div>

        {/* Advanced collapsible */}
        <button
          type="button"
          onClick={() => setAdvancedOpen((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
        >
          {advancedOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {advancedOpen ? 'Hide' : 'Customize more'} (Navbar, Cards, Button text)
        </button>

        {advancedOpen && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-4">
              Optional — leave blank to use smart defaults
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NullableColorInput
                label="Navbar Background"
                value={form.navBg}
                onChange={(v) => handleChange('navBg', v)}
                placeholder="Defaults to page background"
              />
              <NullableColorInput
                label="Navbar Text"
                value={form.navText}
                onChange={(v) => handleChange('navText', v)}
                placeholder="Defaults to #1c1917"
              />
              <NullableColorInput
                label="Card Background"
                value={form.cardBg}
                onChange={(v) => handleChange('cardBg', v)}
                placeholder="Defaults to white"
              />
              <NullableColorInput
                label="Button Text Color"
                value={form.btnText}
                onChange={(v) => handleChange('btnText', v)}
                placeholder="Defaults to white"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Save footer ─────────────────────────────────────────────────── */}
      <div className="px-6 py-4 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60 hover:opacity-90"
          style={{ background: 'var(--color-primary, #7c3aed)' }}
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

    </div>
  );
}

// ── ColorInput ────────────────────────────────────────────────────────────────
function ColorInput({ label, hint, value, onChange }) {
  const [hex, setHex] = useState(value);

  const handleHexChange = (raw) => {
    setHex(raw);
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(raw)) onChange(raw);
  };

  const handlePickerChange = (e) => {
    setHex(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-0.5">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-1.5">{hint}</p>}
      <div className="flex items-center gap-2">
        <div
          className="w-10 h-10 rounded-xl border border-gray-200 flex-shrink-0 overflow-hidden cursor-pointer relative shadow-sm"
          style={{ background: value }}
        >
          <input
            type="color"
            value={value}
            onChange={handlePickerChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <input
          type="text"
          value={hex}
          onChange={(e) => handleHexChange(e.target.value)}
          maxLength={7}
          className="flex-1 min-w-0 border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all"
          placeholder="#7c3aed"
        />
      </div>
    </div>
  );
}

// ── NullableColorInput ────────────────────────────────────────────────────────
function NullableColorInput({ label, value, onChange, placeholder }) {
  const displayColor = value || '#cccccc';

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        <div
          className="w-10 h-10 rounded-xl border border-gray-200 flex-shrink-0 overflow-hidden cursor-pointer relative shadow-sm"
          style={{ background: displayColor }}
        >
          <input
            type="color"
            value={displayColor}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === '' || /^#([0-9A-Fa-f]{0,6})$/.test(raw)) onChange(raw);
          }}
          maxLength={7}
          className="flex-1 min-w-0 border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all"
          placeholder={placeholder}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="flex-shrink-0 text-xs text-gray-400 hover:text-red-500 transition-colors px-1"
            title="Reset to default"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}