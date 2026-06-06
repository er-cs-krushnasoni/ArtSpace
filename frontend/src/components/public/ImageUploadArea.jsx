import { useState, useRef } from 'react';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import usePublicCloudinaryUpload from '../../hooks/usePublicCloudinaryUpload';

const MAX_SIZE_MB = 2;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Reusable image upload area for public order forms.
 * Uploads to Cloudinary via the public signature endpoint.
 * Returns array of { secure_url, public_id } via onChange.
 */
const ImageUploadArea = ({
  slug,
  label,
  images = [],
  onChange,
  maxImages = 3,
  required = false,
  error,
}) => {
  const { upload } = usePublicCloudinaryUpload(slug);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = async (files) => {
    const fileList = Array.from(files);
    setUploadError('');
    const remaining = maxImages - images.length;
    const toUpload = fileList.slice(0, remaining);

    for (const file of toUpload) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setUploadError('Only JPEG, PNG and WebP images allowed.');
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setUploadError(`Max file size is ${MAX_SIZE_MB}MB.`);
        return;
      }
    }

    setUploading(true);
    try {
      const results = await Promise.all(toUpload.map((f) => upload(f)));
      onChange([...images, ...results]);
    } catch {
      setUploadError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (idx) => {
    const updated = images.filter((_, i) => i !== idx);
    onChange(updated);
  };

  const canAddMore = images.length < maxImages;
  const displayError = uploadError || error;

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
          <span className="text-gray-400 dark:text-zinc-500 font-normal ml-1">
            ({maxImages} max)
          </span>
        </label>
      )}

      {/* Thumbnails */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2.5">
          {images.map((img, i) => (
            <div
              key={i}
              className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-700 flex-shrink-0 group"
            >
              <img src={img.secure_url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 w-5 h-5 bg-gray-900/70 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X size={10} />
              </button>
              {/* Always-visible remove on mobile (no hover) */}
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 w-5 h-5 bg-gray-900/70 rounded-full flex items-center justify-center text-white sm:hidden hover:bg-red-600"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {canAddMore && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed rounded-xl flex flex-col items-center justify-center py-6 cursor-pointer transition-all"
          style={{
            borderColor: displayError
              ? '#ef4444'
              : isDragging
              ? 'var(--tenant-primary)'
              : 'color-mix(in srgb, var(--tenant-primary) 40%, #d1d5db)',
            background: isDragging
              ? 'color-mix(in srgb, var(--tenant-primary) 6%, transparent)'
              : 'color-mix(in srgb, var(--tenant-primary) 3%, transparent)',
            transform: isDragging ? 'scale(1.01)' : 'scale(1)',
          }}
        >
          {uploading ? (
            <Loader2
              size={24}
              className="animate-spin mb-1.5"
              style={{ color: 'var(--tenant-primary)' }}
            />
          ) : (
            <ImagePlus
              size={24}
              className="mb-1.5"
              style={{ color: 'color-mix(in srgb, var(--tenant-primary) 60%, #9ca3af)' }}
            />
          )}
          <p className="text-sm text-gray-500 dark:text-zinc-400 text-center font-medium">
            {uploading ? 'Uploading…' : 'Tap to upload or drag & drop'}
          </p>
          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">
            JPEG, PNG, WebP · max {MAX_SIZE_MB}MB
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}

      {displayError && (
        <p className="text-xs text-red-500 dark:text-red-400 mt-1">{displayError}</p>
      )}
    </div>
  );
};

export default ImageUploadArea;