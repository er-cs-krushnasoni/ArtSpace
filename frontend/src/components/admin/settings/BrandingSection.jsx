import { useRef, useState } from 'react';
import { Upload, ImageIcon } from 'lucide-react';
import useCloudinaryUpload from '../../../hooks/useCloudinaryUpload';
import api from '../../../api/axiosInstance';
import toast from 'react-hot-toast';

const MAX_IMAGE_SIZE  = 2 * 1024 * 1024;
const ALLOWED_TYPES   = ['image/jpeg', 'image/png', 'image/webp'];

export default function BrandingSection({ initialData, onSaved }) {
  const { upload, isUploading } = useCloudinaryUpload();
  const fileRef  = useRef(null);
  const [preview, setPreview] = useState(initialData?.websiteConfig?.logo || null);

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
      const { secure_url, public_id } = await upload(file, 'logo');
      await api.put('/tenant/settings/logo', {
        logoUrl:      secure_url,
        logoPublicId: public_id,
      });
      setPreview(secure_url);
      onSaved?.({ logo: secure_url, pwaIcon: secure_url });
      toast.success('Logo updated');
    } catch (err) {
      toast.error(err.message || 'Failed to upload logo');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-0.5">Shop Logo</h2>
      <p className="text-xs text-gray-400 mb-5">
        Used in your public shop header, emails, and as the admin app icon.
        JPEG, PNG, or WebP · Max 2MB.
      </p>

      <div className="flex items-center gap-5">
        {/* Preview / click zone */}
        <div
          onClick={() => fileRef.current?.click()}
          className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden bg-gray-50 cursor-pointer hover:border-violet-400 hover:bg-violet-50/30 transition-all duration-150"
        >
          {preview ? (
            <img src={preview} alt="Logo" className="w-full h-full object-contain" />
          ) : (
            <ImageIcon className="w-7 h-7 text-gray-300" />
          )}
        </div>

        <div>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-xl border border-gray-200 text-gray-600 hover:border-violet-400 hover:text-violet-600 transition-all duration-150 disabled:opacity-60"
          >
            <Upload className="w-4 h-4" />
            {isUploading ? 'Uploading…' : preview ? 'Replace Logo' : 'Upload Logo'}
          </button>
          <p className="text-xs text-gray-400 mt-1.5">
            Click the image or button to upload
          </p>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </div>
  );
}