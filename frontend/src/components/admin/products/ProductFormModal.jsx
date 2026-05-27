import { useState, useRef } from 'react';
import { X, Plus, Loader2, Truck, CalendarClock } from 'lucide-react';
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

  const removePhoto = (idx) => onChange(photos.filter((_, i) => i !== idx));

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-2">
        Photos <span className="text-gray-400">(max {MAX_PHOTOS})</span>
      </label>
      <div className="flex flex-wrap gap-2">
        {photos.map((photo, idx) => (
          <div
            key={photo.publicId}
            className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group"
          >
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

// ─── Category Select ──────────────────────────────────────────────────────────
function CategorySelect({ allCategories, selected, onChange }) {
  // selected: [{ categoryId: string, selectedValues: string[] }]

  const getEntry = (catId) => selected.find((s) => s.categoryId === catId);

  const toggleGroup = (catId) => {
    if (getEntry(catId)) {
      onChange(selected.filter((s) => s.categoryId !== catId));
    } else {
      onChange([...selected, { categoryId: catId, selectedValues: [] }]);
    }
  };

  const toggleValue = (catId, val) => {
    onChange(selected.map((s) => {
      if (s.categoryId !== catId) return s;
      const has = s.selectedValues.includes(val);
      return {
        ...s,
        selectedValues: has
          ? s.selectedValues.filter((v) => v !== val)
          : [...s.selectedValues, val],
      };
    }));
  };

  if (allCategories.length === 0) {
    return (
      <p className="text-xs text-gray-400 italic">
        No categories yet — create them in the Categories section first.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {allCategories.map((group) => {
        const entry = getEntry(group._id);
        const isSelected = Boolean(entry);
        return (
          <div
            key={group._id}
            className={`rounded-lg border transition-all ${
              isSelected ? 'border-violet-200 bg-violet-50/40' : 'border-gray-100 bg-gray-50/50'
            }`}
          >
            {/* Group toggle */}
            <button
              type="button"
              onClick={() => toggleGroup(group._id)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-left"
            >
              <span className={`text-sm font-medium ${isSelected ? 'text-violet-700' : 'text-gray-600'}`}>
                {group.groupName}
              </span>
              <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                isSelected ? 'bg-violet-500 border-violet-500' : 'border-gray-300'
              }`}>
                {isSelected && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </span>
            </button>

            {/* Value chips — only when group is selected and has values */}
            {isSelected && group.values.length > 0 && (
              <div className="px-3 pb-3">
                <p className="text-xs text-gray-400 mb-1.5">Select applicable values:</p>
                <div className="flex flex-wrap gap-1.5">
                  {group.values.map((val) => {
                    const isValOn = entry.selectedValues.includes(val);
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => toggleValue(group._id, val)}
                        className="px-2.5 py-1 rounded-full text-xs font-medium border transition-all"
                        style={
                          isValOn
                            ? { background: '#ede9fe', color: '#6d28d9', borderColor: '#c4b5fd' }
                            : { background: '#fff', color: '#6b7280', borderColor: '#e5e7eb' }
                        }
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
                {entry.selectedValues.length === 0 && (
                  <p className="text-xs text-amber-500 mt-1.5">
                    ⚠ No values selected — product matches all values in this group
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
// ─── Service Toggle Row ───────────────────────────────────────────────────────
function ServicePriceRow({ icon: Icon, label, enabled, onToggle, price, onPriceChange, disabled }) {
  return (
    <div
      className={`rounded-xl border transition-all duration-200 ${
        enabled ? 'border-violet-200 bg-violet-50/40' : 'border-gray-200 bg-gray-50/60'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Icon
            className={`w-4 h-4 transition-colors ${enabled ? 'text-violet-500' : 'text-gray-400'}`}
          />
          <span
            className={`text-sm font-medium transition-colors ${
              enabled ? 'text-gray-800' : 'text-gray-400'
            }`}
          >
            {label}
          </span>
          {enabled ? (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-violet-500 bg-violet-100 rounded-full px-2 py-0.5">
              On
            </span>
          ) : (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 bg-gray-200 rounded-full px-2 py-0.5">
              Off
            </span>
          )}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          disabled={disabled}
          onClick={onToggle}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:opacity-50 ${
            enabled ? 'bg-violet-500 border-violet-500' : 'bg-gray-200 border-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
              enabled ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {enabled && (
        <div className="px-4 pb-3 pt-0">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium select-none">
              ₹
            </span>
            <input
              type="number"
              min="0"
              value={price}
              onChange={(e) => onPriceChange(e.target.value)}
              placeholder="0 for free"
              className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 bg-white"
            />
          </div>
          {price === '' && (
            <p className="text-[11px] text-amber-600 mt-1.5 flex items-center gap-1">
              <span>⚠</span> Enter a price (use 0 if free)
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function ProductFormModal({
  product,
  allCategories,
  deliveryEnabled = true,
  appointmentEnabled = true,
  onClose,
  onSaved,
}) {
  const isEdit = Boolean(product?._id);

  // Toggles are only shown when BOTH services are enabled at shop level.
  // If only one is enabled, no choice to make — just show that price input.
  const showToggles = deliveryEnabled && appointmentEnabled;

  // ── Toggle initial state ───────────────────────────────────────────────────
  // The ONLY source of truth for whether a service is offered on a product is
  // product.deliveryPrice / product.appointmentPrice being non-null.
  // We do NOT check discount.originalDeliveryPrice — that field defaults to 0
  // in mongoose even when no discount ever existed, which would falsely flip
  // a disabled service back to ON.
  const [deliveryOn, setDeliveryOn] = useState(() => {
    if (!showToggles) return true;
    if (!product) return true;
    return product.deliveryPrice !== null && product.deliveryPrice !== undefined;
  });

  const [appointmentOn, setAppointmentOn] = useState(() => {
    if (!showToggles) return true;
    if (!product) return true;
    return product.appointmentPrice !== null && product.appointmentPrice !== undefined;
  });

  // ── Price initial value ────────────────────────────────────────────────────
  // When a discount is active, show the ORIGINAL price (before discount) so
  // the admin edits the base price and the discount re-applies on top.
  const getInitialPrice = (priceField, originalField) => {
    if (!product) return '';
    const val =
      product.discount?.isActive && product.discount[originalField] != null
        ? product.discount[originalField]
        : product[priceField];
    if (val === null || val === undefined) return '';
    return val.toString();
  };

  const [photos, setPhotos] = useState(
    product?.photos?.map((p) => ({ url: p.url, publicId: p.publicId })) || []
  );
  const [name, setName] = useState(product?.name || '');
  const [nameVisible, setNameVisible] = useState(product?.nameVisible !== false);
  const [deliveryPrice, setDeliveryPrice] = useState(
    getInitialPrice('deliveryPrice', 'originalDeliveryPrice')
  );
  const [appointmentPrice, setAppointmentPrice] = useState(
    getInitialPrice('appointmentPrice', 'originalAppointmentPrice')
  );
  const [description, setDescription] = useState(product?.description || '');
  const [selectedCats, setSelectedCats] = useState(() => {
  if (!product?.categories) return [];
  return product.categories.map((c) =>
    typeof c === 'object' && c.categoryId
      ? { categoryId: typeof c.categoryId === 'object' ? c.categoryId._id : c.categoryId,
          selectedValues: c.selectedValues || [] }
      : { categoryId: typeof c === 'object' ? c._id : c, selectedValues: [] }
  );
});
  const [isActive, setIsActive] = useState(product?.isActive !== false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleDeliveryToggle = () => {
    const next = !deliveryOn;
    setDeliveryOn(next);
    if (!next) setDeliveryPrice(''); // clear so stale value can't sneak through as 0
  };

  const handleAppointmentToggle = () => {
    const next = !appointmentOn;
    setAppointmentOn(next);
    if (!next) setAppointmentPrice('');
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Product name is required');
      return;
    }

    // If toggles are hidden (only one shop service), that service is always offered.
    const offerDelivery = deliveryEnabled && (showToggles ? deliveryOn : true);
    const offerAppointment = appointmentEnabled && (showToggles ? appointmentOn : true);

    if (!offerDelivery && !offerAppointment) {
      toast.error('At least one service (delivery or appointment) must be enabled');
      return;
    }
    if (offerDelivery && deliveryPrice === '') {
      toast.error('Enter a delivery price (use 0 if free)');
      return;
    }
    if (offerAppointment && appointmentPrice === '') {
      toast.error('Enter an appointment price (use 0 if free)');
      return;
    }
    if (offerDelivery && Number(deliveryPrice) < 0) {
      toast.error('Delivery price cannot be negative');
      return;
    }
    if (offerAppointment && Number(appointmentPrice) < 0) {
      toast.error('Appointment price cannot be negative');
      return;
    }

    setSaving(true);
    try {
      const payload = {
  name: name.trim(),
  nameVisible,
  description,
  deliveryEnabled: offerDelivery,        // ← add this
  appointmentEnabled: offerAppointment,  // ← add this
  deliveryPrice: offerDelivery ? Number(deliveryPrice) : null,
  appointmentPrice: offerAppointment ? Number(appointmentPrice) : null,
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
      if (err.response?.data?.code === 'TRIAL_PRODUCT_LIMIT') {
        toast.error('Trial limit reached (10 products). Upgrade to add more.');
      } else {
        toast.error(err.response?.data?.message || 'Failed to save product');
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
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {showToggles ? 'Services & Pricing' : 'Pricing'}
              </label>

              {showToggles ? (
                <>
                  <p className="text-xs text-gray-400 mb-3">
                    Toggle off any service this product doesn't support. Enter 0 if the service is free.
                  </p>
                  {product?.discount?.isActive && (
                    <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-3">
                      Showing original prices — discount is active and will re-apply on top of these.
                    </p>
                  )}
                  <div className="space-y-3">
                    <ServicePriceRow
                      icon={Truck}
                      label="Delivery"
                      enabled={deliveryOn}
                      onToggle={handleDeliveryToggle}
                      price={deliveryPrice}
                      onPriceChange={setDeliveryPrice}
                      disabled={saving}
                    />
                    <ServicePriceRow
                      icon={CalendarClock}
                      label="Appointment"
                      enabled={appointmentOn}
                      onToggle={handleAppointmentToggle}
                      price={appointmentPrice}
                      onPriceChange={setAppointmentPrice}
                      disabled={saving}
                    />
                  </div>
                  {!deliveryOn && !appointmentOn && (
                    <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                      <span>⚠</span> At least one service must be enabled.
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-xs text-gray-400 mb-2">
                    Enter 0 if this product is free.
                  </p>
                  {product?.discount?.isActive && (
                    <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-3">
                      Showing original prices — discount is active and will re-apply on top of these.
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
                        placeholder="0 for free"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
                      />
                      {deliveryPrice === '' && (
                        <p className="text-[11px] text-amber-600 mt-1.5">⚠ Enter a price (use 0 if free)</p>
                      )}
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
                        placeholder="0 for free"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
                      />
                      {appointmentPrice === '' && (
                        <p className="text-[11px] text-amber-600 mt-1.5">⚠ Enter a price (use 0 if free)</p>
                      )}
                    </div>
                  )}
                </>
              )}
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