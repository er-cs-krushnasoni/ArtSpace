import { useRef, useState } from 'react';
import { Upload, Trash2, ImageIcon } from 'lucide-react';
import useCloudinaryUpload from '../../../hooks/useCloudinaryUpload';
import api from '../../../api/axiosInstance';
import toast from 'react-hot-toast';

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function ImageUploadCard({ label, hint, currentUrl, uploadType, onSaved, saveEndpoint, urlField, publicIdField }) {
  const { upload, isUploading } = useCloudinaryUpload();
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(currentUrl || null);

  const handleFile = async (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Only JPEG, PNG, or WebP images allowed');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('Image must be under 2MB');
      return;
    }

    try {
      const { secure_url, public_id } = await upload(file, uploadType);

      // Save to backend
      await api.put(saveEndpoint, {
        [urlField]: secure_url,
        [publicIdField]: public_id,
      });

      setPreview(secure_url);
      onSaved?.({ [urlField]: secure_url, [publicIdField]: public_id });
      toast.success(`${label} updated`);
    } catch (err) {
      toast.error(err.message || `Failed to upload ${label.toLowerCase()}`);
    }
  };

  return (
    <div className="flex items-start gap-4">
      {/* Preview */}
      <div
        className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden bg-gray-50 cursor-pointer hover:border-violet-400 transition-all"
        onClick={() => fileRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt={label} className="w-full h-full object-contain" />
        ) : (
          <ImageIcon className="w-6 h-6 text-gray-300" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{hint}</p>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={isUploading}
          className="mt-2 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:border-violet-400 hover:text-violet-600 transition-all disabled:opacity-60"
        >
          <Upload className="w-3.5 h-3.5" />
          {isUploading ? 'Uploading…' : preview ? 'Replace' : 'Upload'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>
    </div>
  );
}

export default function BrandingSection({ initialData, onSaved }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-5">Branding Assets</h2>

      <div className="space-y-6">
        <ImageUploadCard
          label="Shop Logo"
          hint="Shown in header, emails, and PWA. JPEG, PNG, or WebP. Max 2MB."
          currentUrl={initialData?.websiteConfig?.logo}
          uploadType="logo"
          saveEndpoint="/tenant/settings/logo"
          urlField="logoUrl"
          publicIdField="logoPublicId"
          onSaved={(data) => onSaved?.({ logo: data.logoUrl })}
        />

        <div className="border-t border-gray-100" />

        <ImageUploadCard
          label="PWA App Icon"
          hint="Square icon for the installed admin app. Recommended: 512×512px."
          currentUrl={initialData?.websiteConfig?.pwaIcon}
          uploadType="pwa_icon"
          saveEndpoint="/tenant/settings/pwa-icon"
          urlField="pwaIconUrl"
          publicIdField="pwaIconPublicId"
          onSaved={(data) => onSaved?.({ pwaIcon: data.pwaIconUrl })}
        />
      </div>
    </div>
  );
}