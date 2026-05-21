import { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Public version of Cloudinary upload hook — no auth required.
 * Uses the public upload-signature endpoint.
 */
const usePublicCloudinaryUpload = (slug) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const upload = async (file) => {
    setIsUploading(true);
    setError(null);

    try {
      // Step 1: Get signed upload params from public backend
      const sigRes = await fetch(`${API_BASE}/public/${slug}/upload-signature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadType: 'query_image' }),
      });

      if (!sigRes.ok) throw new Error('Failed to get upload signature');
      const sigJson = await sigRes.json();
      const { signature, timestamp, folder, cloudName, apiKey } = sigJson.data;

      // Step 2: Upload directly to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp);
      formData.append('api_key', apiKey);
      formData.append('folder', folder);

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      const response = await fetch(uploadUrl, { method: 'POST', body: formData });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || 'Cloudinary upload failed');
      }

      const data = await response.json();
      return { secure_url: data.secure_url, public_id: data.public_id };
    } catch (err) {
      const msg = err.message || 'Upload failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  return { upload, isUploading, error };
};

export default usePublicCloudinaryUpload;