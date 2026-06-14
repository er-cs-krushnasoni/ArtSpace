import * as React from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Public version of Cloudinary upload hook — no auth required.
 * Uses the public upload-signature endpoint.
 */
const usePublicCloudinaryUpload = (slug) => {
  // Guard: if React module is null/broken during HMR, return safe defaults
  if (!React || !React.useState) {
    return {
      upload: async () => { throw new Error('Upload unavailable, please refresh'); },
      isUploading: false,
      error: null,
    };
  }

  const [isUploading, setIsUploading] = React.useState(false); // eslint-disable-line react-hooks/rules-of-hooks
  const [error, setError] = React.useState(null);               // eslint-disable-line react-hooks/rules-of-hooks

  const upload = async (file) => {
    setIsUploading(true);
    setError(null);
    try {
      const sigRes = await fetch(`${API_BASE}/public/${slug}/upload-signature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadType: 'query_image' }),
      });
      if (!sigRes.ok) throw new Error('Failed to get upload signature');
      const sigJson = await sigRes.json();
      const { signature, timestamp, folder, cloudName, apiKey } = sigJson.data;

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