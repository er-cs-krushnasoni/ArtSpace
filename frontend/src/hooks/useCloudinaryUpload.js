import { useState } from 'react';
import api from '../api/axiosInstance';

/**
 * Hook for uploading files to Cloudinary via signed backend URL.
 * Flow: get signature from backend → upload directly to Cloudinary → return { secure_url, public_id }
 */
const useCloudinaryUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const upload = async (file, uploadType) => {
    setIsUploading(true);
    setError(null);

    try {
      // Step 1: Get signed upload params from backend
      const sigRes = await api.post('/tenant/settings/upload-signature', { uploadType });
      const { signature, timestamp, folder, cloudName, apiKey } = sigRes.data.data;

      // Step 2: Upload directly to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp);
      formData.append('api_key', apiKey);
      formData.append('folder', folder);

      const resourceType = uploadType === 'tutorial_video' ? 'video' : 'image';
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

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

export default useCloudinaryUpload;