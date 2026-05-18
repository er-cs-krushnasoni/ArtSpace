import { useState, useRef, useEffect } from 'react';
import { X, Plus, ImageIcon, Loader2 } from 'lucide-react';
import useCloudinaryUpload from '../../../hooks/useCloudinaryUpload';
import api from '../../../api/axiosInstance';
import toast from 'react-hot-toast';

const MAX_PHOTOS = 5;
const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// ─── Photo Uploader ───────────────────────────────────────────────────────────
function PhotoUploader({ photos, onChange, uploading, setUploading }) {
  const { upload } = useCloudinaryUpload();
  const fileRef = useRef(null);

  const handleFiles = async (files) => {
    const remaining = MAX_PHOTOS - photos.length;
    const toUpload = Array.from(files).slice(0, remaining);
    if (toUpload.length === 0) return;

    setUploading(true);
    try {
      const results = [];
      for (const file of toUpload) {
        if (!ALLOWED_TYPES.includes(file.type)) {
          toast.error(`${file.name}: only JPEG, PNG, WebP allowed`);
          continue;
        }
        if (file.size > MAX_SIZE) {
          toast.error(`${file.name}: max 2MB`);
          continue;
        }
        const { secure_url, public_id } = await upload(file, 'product_photo');
        results.push({ url: secure_url, publicId: public_id });
      }
      onChange([...photos, ...results]);
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (idx) => {
    const updated = photos.filter((_, i) => i !== idx);
    onChange(updated);
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-2">
        Photos <span className="text-gray-400">(max {MAX_PHOTOS})</span>
      </label>
      <div className="flex flex-wrap gap-2">
        {photos.map((photo, idx) => (
          <div key={photo.publicId} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group">
            <img src={photo.url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removePhoto(idx)}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        ))}

        {photos.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center hover:border-violet-400 transition-all disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
            ) : (
              <>
                <Plus className="w-5 h-5 text-gray-400" />
                <span className="text-xs text-gray-400 mt-0.5">Add</span>
              </>
            )}
          </button>
        )}

        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => e.target.files?.length && handleFiles(e.target.files)}
        />
      </div>
    </div>
  );
}

// ─── Category Multi-Select ────────────────────────────────────────────────────
function CategorySelect({ allCategories, selected, onChange }) {
  // selected = array of category _id strings
  const toggle = (catId) => {
    if (selected.includes(catId)) {
      onChange(selected.filter((id) => id !== catId));
    } else {
      onChange([...selected, catId]);
    }
  };

  if (allCategories.length === 0) {
    return (
      <p className="text-xs text-gray-400 italic">
        No categories yet — create them in the Categories section first.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {allCategories.map((group) => (
        <div key={group._id}>
          <p className="text-xs font-medium text-gray-500 mb-1.5">{group.groupName}</p>
          <div className="flex flex-wrap gap-1.5">
            {group.values.map((val) => {
              // We use groupId:value as a virtual key but store groupId in categories
              // Actually categories[] stores Category ObjectIds (group level)
              const isSelected = selected.includes(group._id);
              return null; // handled below
            })}
          </div>
        </div>
      ))}
      {/* Group-level selection */}
      <div className="flex flex-wrap gap-2">
        {allCategories.map((group) => {
          const isSelected = selected.includes(group._id);
          return (
            <button
              key={group._id}
              type="button"
              onClick={() => toggle(group._id)}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border transition-all"
              style={
                isSelected
                  ? { background: '#ede9fe', color: '#6d28d9', borderColor: '#c4b5fd' }
                  : { background: 'white', color: '#6b7280', borderColor: '#e5e7eb' }
              }
            >
              {group.groupName}
              {group.values.length > 0 && (
                <span className="ml-1.5 text-xs opacity-60">
                  ({group.values.slice(0, 2).join(', ')}{group.values.length > 2 ? '…' : ''})
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function ProductFormModal({ product, allCategories, deliveryEnabled = true, appointmentEnabled = true, onClose, onSaved }) {
      const isEdit = Boolean(product?._id);

  const [photos, setPhotos] = useState(
    product?.photos?.map((p) => ({ url: p.url, publicId: p.publicId })) || []
  );
  const [name, setName] = useState(product?.name || '');
  const [nameVisible, setNameVisible] = useState(product?.nameVisible !== false);
// Always use original prices when discount is active — never show/edit discounted price
  const originalDeliveryPrice = product?.discount?.isActive
    ? product.discount.originalDeliveryPrice
    : product?.deliveryPrice;
  const originalAppointmentPrice = product?.discount?.isActive
    ? product.discount.originalAppointmentPrice
    : product?.appointmentPrice;

  const [deliveryPrice, setDeliveryPrice] = useState(originalDeliveryPrice?.toString() || '');
  const [appointmentPrice, setAppointmentPrice] = useState(originalAppointmentPrice?.toString() || '');
  const [selectedCats, setSelectedCats] = useState(
    product?.categories?.map((c) => (typeof c === 'object' ? c._id : c)) || []
  );
const [description, setDescription] = useState(product?.description || '');
  const [isActive, setIsActive] = useState(product?.isActive !== false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Product name is required'); return; }
if (deliveryEnabled && (deliveryPrice === '' || Number(deliveryPrice) < 0)) { toast.error('Enter a valid delivery price'); return; }
    if (appointmentEnabled && (appointmentPrice === '' || Number(appointmentPrice) < 0)) { toast.error('Enter a valid appointment price'); return; }

    setSaving(true);
    try {
      // If product has active discount, we update the original prices
      // Backend stores current (discounted) prices — we need to recalculate
      const baseDeliveryPrice = deliveryEnabled ? Number(deliveryPrice) : 0;
      const baseAppointmentPrice = appointmentEnabled ? Number(appointmentPrice) : 0;

      const payload = {
        name: name.trim(),
        nameVisible,
        description,
        deliveryPrice: baseDeliveryPrice,
        appointmentPrice: baseAppointmentPrice,
        categories: selectedCats,
        isActive,
        photos,
      };

      let res;
      if (isEdit) {
        res = await api.put(`/tenant/products/${product._id}`, payload);
      } else {
        res = await api.post('/tenant/products', payload);
      }

      onSaved(res.data.data, isEdit ? 'update' : 'create');
      toast.success(isEdit ? 'Product updated' : 'Product created');
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save product';
      if (err.response?.data?.code === 'TRIAL_PRODUCT_LIMIT') {
        toast.error('Trial limit reached (10 products). Please upgrade to add more.');
      } else {
        toast.error(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">
            {isEdit ? 'Edit Product' : 'Add Product'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Photos */}
          <PhotoUploader
            photos={photos}
            onChange={setPhotos}
            uploading={uploading}
            setUploading={setUploading}
          />

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. French Tip Nails"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
            />
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={nameVisible}
                onChange={(e) => setNameVisible(e.target.checked)}
                className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
              />
              <span className="text-xs text-gray-600">Show name on public shop</span>
            </label>
          </div>

         
          {/* Pricing */}
          {(deliveryEnabled || appointmentEnabled) && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Pricing <span className="text-red-500">*</span>
              </label>
              <div className={`grid gap-3 ${deliveryEnabled && appointmentEnabled ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {product?.discount?.isActive && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 col-span-2">
                  Showing original prices — discount is active. Saving will keep the discount applied on top of these prices.
                </p>
              )}
              {deliveryEnabled && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Delivery Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={deliveryPrice}
                      onChange={(e) => setDeliveryPrice(e.target.value)}
                      placeholder="0"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
                    />
                  </div>
                )}
                {appointmentEnabled && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Appointment Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={appointmentPrice}
                      onChange={(e) => setAppointmentPrice(e.target.value)}
                      placeholder="0"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Description <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this product — materials, style, what's included…"
              rows={3}
              maxLength={500}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{description.length}/500</p>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Categories</label>
            <CategorySelect
              allCategories={allCategories}
              selected={selectedCats}
              onChange={setSelectedCats}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Status</label>
            <div className="flex gap-2">
              {[true, false].map((val) => (
                <button
                  key={String(val)}
                  type="button"
                  onClick={() => setIsActive(val)}
                  className="flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-all"
                  style={
                    isActive === val
                      ? val
                        ? { background: '#d1fae5', color: '#065f46', borderColor: '#6ee7b7' }
                        : { background: '#f3f4f6', color: '#374151', borderColor: '#d1d5db' }
                      : { background: 'white', color: '#6b7280', borderColor: '#e5e7eb' }
                  }
                >
                  {val ? 'Active' : 'Inactive'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 justify-end px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all disabled:opacity-60"
            style={{ background: 'var(--color-primary, #8b5cf6)' }}
          >
            {saving ? 'Saving…' : uploading ? 'Uploading…' : isEdit ? 'Update Product' : 'Add Product'}
          </button>
        </div>
      </div>
    </div>
  );
}