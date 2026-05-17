import { useRef, useState } from 'react';
import { Video, Upload, Trash2 } from 'lucide-react';
import useCloudinaryUpload from '../../../hooks/useCloudinaryUpload';
import api from '../../../api/axiosInstance';
import toast from 'react-hot-toast';

const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

export default function TutorialVideoSection({ initialData }) {
  const { upload, isUploading } = useCloudinaryUpload();
  const fileRef = useRef(null);
  const [videoUrl, setVideoUrl] = useState(initialData?.websiteConfig?.tutorialVideoUrl || null);
  const [removing, setRemoving] = useState(false);

  const handleFile = async (file) => {
    if (!file.type.startsWith('video/')) { toast.error('Please upload a video file'); return; }
    if (file.size > MAX_VIDEO_SIZE) { toast.error('Video must be under 50MB'); return; }

    try {
      const { secure_url, public_id } = await upload(file, 'tutorial_video');
      await api.put('/tenant/settings/tutorial-video', {
        tutorialVideoUrl: secure_url,
        tutorialVideoPublicId: public_id,
      });
      setVideoUrl(secure_url);
      toast.success('Tutorial video uploaded');
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    }
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await api.put('/tenant/settings/tutorial-video', { remove: true });
      setVideoUrl(null);
      toast.success('Tutorial video removed');
    } catch {
      toast.error('Failed to remove video');
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-1">Tutorial Video</h2>
      <p className="text-xs text-gray-400 mb-5">Shown to customers who select delivery on an order. Max 50MB.</p>

      {videoUrl ? (
        <div className="space-y-3">
          <video
            src={videoUrl}
            controls
            className="w-full max-h-48 rounded-lg bg-black"
          />
          <div className="flex gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-gray-200 rounded-lg text-gray-600 hover:border-violet-400 hover:text-violet-600 transition-all"
            >
              <Upload className="w-4 h-4" />
              {isUploading ? 'Uploading…' : 'Replace'}
            </button>
            <button
              onClick={handleRemove}
              disabled={removing}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              {removing ? 'Removing…' : 'Remove'}
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileRef.current?.click()}
          className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-violet-400 transition-all"
        >
          <Video className="w-8 h-8 text-gray-300 mb-2" />
          <p className="text-sm text-gray-500">{isUploading ? 'Uploading…' : 'Click to upload tutorial video'}</p>
          <p className="text-xs text-gray-400 mt-0.5">MP4, MOV, or WebM</p>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </div>
  );
}