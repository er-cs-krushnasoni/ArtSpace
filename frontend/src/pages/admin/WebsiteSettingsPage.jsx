import { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import api from '../../api/axiosInstance';
import GeneralSettingsSection from '../../components/admin/settings/GeneralSettingsSection';
import BrandingSection from '../../components/admin/settings/BrandingSection';
import TogglesSection from '../../components/admin/settings/TogglesSection';
import SliderSection from '../../components/admin/settings/SliderSection';
import TutorialVideoSection from '../../components/admin/settings/TutorialVideoSection';
import SlugSection from '../../components/admin/settings/SlugSection';
import CredentialsSection from '../../components/admin/settings/CredentialsSection';
import BusinessTypeSection from '../../components/admin/settings/BusinessTypeSection';

// Skeleton loader
const SectionSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 animate-pulse">
    <div className="h-4 bg-gray-100 rounded w-1/4 mb-5" />
    <div className="space-y-3">
      <div className="h-3 bg-gray-100 rounded w-3/4" />
      <div className="h-8 bg-gray-100 rounded" />
      <div className="h-8 bg-gray-100 rounded" />
    </div>
  </div>
);

export default function WebsiteSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tenant/settings');
      setSettings(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneralSaved = (updated) => {
    setSettings((s) => ({
      ...s,
      businessName: updated.businessName,
      websiteConfig: {
        ...s.websiteConfig,
        address: updated.address,
        whatsapp: updated.whatsapp,
        instagram: updated.instagram,
        primaryColor: updated.primaryColor,
        accentColor: updated.accentColor,
      },
    }));
  };

  const handleTogglesSaved = (updated) => {
    setSettings((s) => ({
      ...s,
      websiteConfig: { ...s.websiteConfig, ...updated },
    }));
  };

  const sliderEnabled = settings?.websiteConfig?.sliderEnabled ?? false;
  const deliveryEnabled = settings?.websiteConfig?.deliveryEnabled ?? true;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Website Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your public shop appearance and features</p>
        </div>
        <div className="hidden sm:flex items-center justify-center w-10 h-10 bg-violet-50 rounded-xl">
          <Settings className="w-5 h-5 text-violet-600" />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => <SectionSkeleton key={i} />)}
        </div>
      ) : settings ? (
        <div className="space-y-6">
          <GeneralSettingsSection
            initialData={settings}
            onSaved={handleGeneralSaved}
          />

          <BrandingSection
            initialData={settings}
            onSaved={(updated) => setSettings((s) => ({
              ...s,
              websiteConfig: { ...s.websiteConfig, ...updated },
            }))}
          />
          <BusinessTypeSection
            initialData={settings}
            onSaved={(updated) => setSettings((s) => ({ ...s, ...updated }))}
          />

          <TogglesSection
            initialData={settings}
            onSaved={handleTogglesSaved}
          />

          {sliderEnabled && (
            <SliderSection sliderEnabled={sliderEnabled} />
          )}

          {deliveryEnabled && (
            <TutorialVideoSection initialData={settings} />
          )}

          <SlugSection currentSlug={settings.slug} />
          <CredentialsSection initialData={settings} />

        </div>
      ) : null}
    </div>
  );
}