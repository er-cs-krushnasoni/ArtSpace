import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, Edit2, ImageIcon, X } from 'lucide-react';
import useCloudinaryUpload from '../../../hooks/useCloudinaryUpload';
import api from '../../../api/axiosInstance';
import toast from 'react-hot-toast';

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// ─── Slide Modal ──────────────────────────────────────────────────────────────
function SlideModal({ slide, onClose, onSaved }) {
  const { upload, isUploading } = useCloudinaryUpload();
  const fileRef = useRef(null);
  const isEdit = Boolean(slide?._id);

  const [form, setForm] = useState({
    imageUrl: slide?.imageUrl || '',
    imagePublicId: slide?.imagePublicId || '',
    title: slide?.title || '',
    linkType: slide?.linkType || 'none',
    linkId: slide?.linkId || '',
  });
  const [saving, setSaving] = useState(false);

  const handleImageFile = async (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) { toast.error('JPEG, PNG, or WebP only'); return; }
    if (file.size > MAX_IMAGE_SIZE) { toast.error('Max 2MB'); return; }
    try {
      const { secure_url, public_id } = await upload(file, 'slider_image');
      setForm((f) => ({ ...f, imageUrl: secure_url, imagePublicId: public_id }));
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    }
  };

  const handleSave = async () => {
    if (!form.imageUrl) { toast.error('Please upload a slide image'); return; }
    setSaving(true);
    try {
      if (isEdit) {
        const res = await api.put(`/tenant/settings/sliders/${slide._id}`, {
          title: form.title,
          linkType: form.linkType,
          linkId: form.linkId,
        });
        onSaved(res.data.data, 'update');
      } else {
        const res = await api.post('/tenant/settings/sliders', form);
        onSaved(res.data.data, 'create');
      }
      toast.success(isEdit ? 'Slide updated' : 'Slide added');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save slide');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-gray-900">{isEdit ? 'Edit Slide' : 'Add Slide'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-4">
          {/* Image upload */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Slide Image <span className="text-red-500">*</span></label>
            <div
              onClick={() => fileRef.current?.click()}
              className="w-full h-36 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-violet-400 transition-all overflow-hidden bg-gray-50"
            >
              {form.imageUrl ? (
                <img src={form.imageUrl} alt="Slide" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                  <p className="text-xs text-gray-400">{isUploading ? 'Uploading…' : 'Click to upload'}</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Slide Title (optional)</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
              placeholder="e.g. Summer Collection 2025"
            />
          </div>

          {/* Link type */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Link to</label>
            <select
              value={form.linkType}
              onChange={(e) => setForm((f) => ({ ...f, linkType: e.target.value, linkId: '' }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
            >
              <option value="none">No link</option>
              <option value="product">Product</option>
              <option value="category">Category</option>
            </select>
          </div>

          {/* Link ID — shown when product or category */}
          {form.linkType !== 'none' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                {form.linkType === 'product' ? 'Product ID' : 'Category'} (optional)
              </label>
              <input
                type="text"
                value={form.linkId}
                onChange={(e) => setForm((f) => ({ ...f, linkId: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
                placeholder="Will be populated in Phase 6/7"
              />
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || isUploading}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all disabled:opacity-60"
            style={{ background: 'var(--color-primary, #8b5cf6)' }}
          >
            {saving ? 'Saving…' : isEdit ? 'Update Slide' : 'Add Slide'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SliderSection({ sliderEnabled }) {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (sliderEnabled) fetchSlides();
  }, [sliderEnabled]);

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tenant/settings/sliders');
      setSlides(res.data.data || []);
    } catch {
      toast.error('Failed to load slides');
    } finally {
      setLoading(false);
    }
  };

  const handleModalSaved = (savedSlide, action) => {
    if (action === 'create') {
      setSlides((s) => [...s, savedSlide]);
    } else {
      setSlides((s) => s.map((sl) => (sl._id === savedSlide._id ? savedSlide : sl)));
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/tenant/settings/sliders/${id}`);
      setSlides((s) => s.filter((sl) => sl._id !== id));
      toast.success('Slide deleted');
    } catch {
      toast.error('Failed to delete slide');
    } finally {
      setDeletingId(null);
    }
  };

  const handleReorder = async (from, to) => {
    const reordered = [...slides];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    setSlides(reordered);

    try {
      await api.put('/tenant/settings/sliders/reorder', {
        orderedIds: reordered.map((s) => s._id),
      });
    } catch {
      fetchSlides(); // revert on failure
      toast.error('Failed to reorder');
    }
  };

  if (!sliderEnabled) return null;

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Hero Slider</h2>
            <p className="text-xs text-gray-400 mt-0.5">{slides.length}/5 slides</p>
          </div>
          <button
            onClick={() => { setEditingSlide(null); setModalOpen(true); }}
            disabled={slides.length >= 5}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white rounded-lg transition-all disabled:opacity-40"
            style={{ background: 'var(--color-primary, #8b5cf6)' }}
          >
            <Plus className="w-4 h-4" />
            Add Slide
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : slides.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ImageIcon className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-500">No slides yet</p>
            <p className="text-xs text-gray-400 mt-1">Add up to 5 images for your hero slider</p>
          </div>
        ) : (
          <div className="space-y-3">
            {slides.map((slide, idx) => (
              <div key={slide._id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
                {/* Thumbnail */}
                <div className="w-14 h-10 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                  <img src={slide.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{slide.title || 'Untitled slide'}</p>
                  <p className="text-xs text-gray-400 capitalize">{slide.linkType === 'none' ? 'No link' : `→ ${slide.linkType}`}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => idx > 0 && handleReorder(idx, idx - 1)}
                    disabled={idx === 0}
                    className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 transition-all"
                  >
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => idx < slides.length - 1 && handleReorder(idx, idx + 1)}
                    disabled={idx === slides.length - 1}
                    className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 transition-all"
                  >
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => { setEditingSlide(slide); setModalOpen(true); }}
                    className="p-1.5 rounded hover:bg-gray-100 transition-all"
                  >
                    <Edit2 className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(slide._id)}
                    disabled={deletingId === slide._id}
                    className="p-1.5 rounded hover:bg-red-50 transition-all disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <SlideModal
          slide={editingSlide}
          onClose={() => { setModalOpen(false); setEditingSlide(null); }}
          onSaved={handleModalSaved}
        />
      )}
    </>
  );
}