import { useState, useEffect, useMemo } from 'react';
import { X, ShoppingBag, Palette, Calendar as CalendarIcon, Search } from 'lucide-react';
import api from '../../../api/axiosInstance';
import toast from 'react-hot-toast';
import useCloudinaryUpload from '../../../hooks/useCloudinaryUpload';

const COUNTRY_CODES = [
  { code: '+91', label: '🇮🇳 +91' },
  { code: '+1',  label: '🇺🇸 +1'  },
  { code: '+44', label: '🇬🇧 +44' },
  { code: '+971',label: '🇦🇪 +971'},
  { code: '+65', label: '🇸🇬 +65' },
  { code: '+61', label: '🇦🇺 +61' },
  { code: '+60', label: '🇲🇾 +60' },
  { code: '+66', label: '🇹🇭 +66' },
  { code: '+81', label: '🇯🇵 +81' },
];

const TYPE_OPTIONS = [
  {
    key: 'SHOP_ORDER',
    icon: ShoppingBag,
    label: 'Shop Order',
    desc: 'Order for a specific product',
    border: 'border-violet-300 bg-violet-50',
    text: 'text-violet-700',
    iconBg: 'bg-violet-100',
  },
  {
    key: 'CUSTOM_ORDER',
    icon: Palette,
    label: 'Custom Order',
    desc: 'Custom design request',
    border: 'border-pink-300 bg-pink-50',
    text: 'text-pink-700',
    iconBg: 'bg-pink-100',
  },
  {
    key: 'APPOINTMENT',
    icon: CalendarIcon,
    label: 'Appointment',
    desc: 'Book an appointment',
    border: 'border-blue-300 bg-blue-50',
    text: 'text-blue-700',
    iconBg: 'bg-blue-100',
  },
];

// ─── Admin image upload (uses authenticated hook) ─────────────────────────────
const AdminImageUpload = ({ label, images, onChange, maxImages = 3, required = false, error }) => {
  const { upload } = useCloudinaryUpload();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFiles = async (files) => {
    const list = Array.from(files).slice(0, maxImages - images.length);
    setUploadError('');
    for (const f of list) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
        setUploadError('Only JPEG, PNG and WebP allowed.');
        return;
      }
      if (f.size > 2 * 1024 * 1024) {
        setUploadError('Max 2MB per image.');
        return;
      }
    }
    setUploading(true);
    try {
      const results = await Promise.all(list.map((f) => upload(f, 'query_image')));
      onChange([...images, ...results]);
    } catch {
      setUploadError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const remove = (i) => onChange(images.filter((_, idx) => idx !== i));
  const canAdd = images.length < maxImages;
  const displayError = uploadError || error;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        <span className="text-gray-400 font-normal ml-1">({maxImages} max)</span>
      </label>
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {images.map((img, i) => (
            <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200">
              <img src={img.secure_url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute top-0.5 right-0.5 w-4 h-4 bg-gray-900/70 rounded-full flex items-center justify-center text-white text-[10px] hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      {canAdd && (
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl py-4 cursor-pointer hover:border-violet-300 hover:bg-violet-50/30 transition-colors">
          <span className="text-xs text-gray-500">{uploading ? 'Uploading…' : 'Click to upload'}</span>
          <span className="text-xs text-gray-400">JPEG, PNG, WebP · max 2MB</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
            disabled={uploading}
          />
        </label>
      )}
      {displayError && <p className="text-xs text-red-500 mt-1">{displayError}</p>}
    </div>
  );
};

const Field = ({ label, required, error, children }) => (
  <div>
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )}
    {children}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition';

// ─── Product selector with search ────────────────────────────────────────────
const ProductSelector = ({ products, loading, selectedId, onChange, error }) => {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    return products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const selected = products.find((p) => p._id === selectedId);

  const getDisplayPrice = (p) => {
    const parts = [];
    if (p.deliveryEnabled && p.deliveryPrice != null) {
      if (p.discount?.isActive) {
        parts.push(
          <span key="d">
            Delivery:{' '}
            <span className="line-through text-gray-400">
              ₹{p.discount.originalDeliveryPrice}
            </span>{' '}
            <span className="text-green-600 font-semibold">₹{p.deliveryPrice}</span>
          </span>
        );
      } else {
        parts.push(<span key="d">Delivery: ₹{p.deliveryPrice}</span>);
      }
    }
    if (p.appointmentEnabled && p.appointmentPrice != null) {
      if (p.discount?.isActive) {
        parts.push(
          <span key="a">
            Appt:{' '}
            <span className="line-through text-gray-400">
              ₹{p.discount.originalAppointmentPrice}
            </span>{' '}
            <span className="text-green-600 font-semibold">₹{p.appointmentPrice}</span>
          </span>
        );
      } else {
        parts.push(<span key="a">Appt: ₹{p.appointmentPrice}</span>);
      }
    }
    return parts;
  };

  if (loading) return <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />;

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full px-3 py-2 rounded-lg border text-sm text-left transition flex items-center justify-between ${
          error ? 'border-red-400' : 'border-gray-200'
        } focus:outline-none focus:ring-2 focus:ring-violet-400`}
      >
        {selected ? (
          <div className="flex items-center gap-2 min-w-0">
            {selected.photos?.[0]?.url && (
              <img
                src={selected.photos[0].url}
                alt=""
                className="w-7 h-7 rounded-md object-cover flex-shrink-0"
              />
            )}
            <span className="truncate text-gray-900">{selected.name}</span>
          </div>
        ) : (
          <span className="text-gray-400">Select a product…</span>
        )}
        <span className="text-gray-400 ml-2">▾</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-20 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded-lg">
              <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products…"
                className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>
          {/* List */}
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-400">No products found</div>
            ) : (
              filtered.map((p) => (
                <button
                  key={p._id}
                  type="button"
                  onClick={() => {
                    onChange(p._id);
                    setOpen(false);
                    setSearch('');
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left ${
                    selectedId === p._id ? 'bg-violet-50' : ''
                  }`}
                >
                  {p.photos?.[0]?.url ? (
                    <img
                      src={p.photos[0].url}
                      alt=""
                      className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-gray-100 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500 mt-0.5">
                      {getDisplayPrice(p)}
                    </div>
                  </div>
                  {selectedId === p._id && (
                    <span className="text-violet-600 text-xs font-semibold flex-shrink-0">✓</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Click-outside close */}
      {open && (
        <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

// ─── Admin duplicate dialog ───────────────────────────────────────────────────
const AdminDuplicateDialog = ({ onUpdate, onCancel, isUpdating }) => (
  <div
    className="fixed inset-0 z-[60] flex items-center justify-center p-4"
    style={{ background: 'rgba(0,0,0,0.5)' }}
  >
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
      <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-4">
        <span className="text-violet-600 text-xl font-bold">!</span>
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-2">Duplicate Query Found</h3>
      <p className="text-sm text-gray-500 mb-6 leading-relaxed">
        A pending request already exists for this customer and query type. Update it with new details or cancel?
      </p>
      <div className="flex flex-col gap-2">
        <button
          onClick={onUpdate}
          disabled={isUpdating}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: 'var(--color-primary)' }}
        >
          {isUpdating ? 'Updating…' : 'Update existing request'}
        </button>
        <button
          onClick={onCancel}
          disabled={isUpdating}
          className="w-full py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);

// ─── Main modal ───────────────────────────────────────────────────────────────
export default function ManualQueryModal({ slug, onClose, onCreated }) {
  const [step, setStep] = useState(1);
  const [queryType, setQueryType] = useState(null);

  const [customerName, setCustomerName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [mobile, setMobile] = useState('');
  const [instagram, setInstagram] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [descriptionText, setDescriptionText] = useState('');
  const [orderType, setOrderType] = useState('');
  const [address, setAddress] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [referenceImages, setReferenceImages] = useState([]);
  const [descriptionImages, setDescriptionImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [tenantConfig, setTenantConfig] = useState(null);

  const [duplicateQueryId, setDuplicateQueryId] = useState(null);
  const [pendingPayload, setPendingPayload] = useState(null);
  const [updatingDuplicate, setUpdatingDuplicate] = useState(false);

  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    fetch(`${API_BASE}/public/${slug}/config`)
      .then((r) => r.json())
      .then((j) => setTenantConfig(j.data))
      .catch(() => {});
  }, [slug]);

  useEffect(() => {
    if (queryType === 'SHOP_ORDER' && step === 2) {
      setProductsLoading(true);
      api.get('/tenant/products')
        .then((r) => {
          const all = r.data.data || [];
          // Only active products
          setProducts(all.filter((p) => p.isActive));
        })
        .catch(() => setProducts([]))
        .finally(() => setProductsLoading(false));
    }
  }, [queryType, step]);

  const getOrderTypeOptions = () => {
    if (!tenantConfig) return [];
    const wc = tenantConfig.websiteConfig || {};
    const opts = [];
    if (queryType === 'SHOP_ORDER' || queryType === 'CUSTOM_ORDER') {
      opts.push({ value: 'pickup', label: 'Pickup' });
      if (wc.deliveryEnabled) opts.push({ value: 'delivery', label: 'Delivery' });
    }
    if (queryType === 'SHOP_ORDER') {
      if (wc.appointmentEnabled !== false) {
        opts.push({ value: 'at_shop', label: 'Appt. at Shop' });
        if (wc.appointmentAtHome !== false) {
          opts.push({ value: 'at_home', label: 'Appt. at Home' });
        }
      }
    }
    if (queryType === 'APPOINTMENT') {
      if (wc.appointmentEnabled !== false) {
        opts.push({ value: 'at_shop', label: 'Appt. at Shop' });
        if (wc.appointmentAtHome !== false) {
          opts.push({ value: 'at_home', label: 'Appt. at Home' });
        }
      }
    }
    return opts;
  };

  const needsAddress = orderType === 'delivery' || orderType === 'at_home';

  // Show the selected product's current price
  const selectedProduct = products.find((p) => p._id === selectedProductId);
  const selectedProductPrice = (() => {
    if (!selectedProduct) return null;
    if (orderType === 'delivery' || orderType === 'pickup') {
      return selectedProduct.deliveryEnabled ? selectedProduct.deliveryPrice : null;
    }
    if (orderType === 'at_shop' || orderType === 'at_home') {
      return selectedProduct.appointmentEnabled ? selectedProduct.appointmentPrice : null;
    }
    return null;
  })();

  const validate = () => {
    const errs = {};
    if (!customerName.trim()) errs.customerName = 'Name is required';
    if (!mobile.trim() || !/^\d{7,}$/.test(mobile.replace(/\s+/g, '')))
      errs.mobile = 'Valid mobile number required';
    if (!orderType) errs.orderType = 'Select an order type';
    if (needsAddress && !address.trim()) errs.address = 'Address is required';
    if (queryType === 'SHOP_ORDER' && !selectedProductId) errs.productId = 'Select a product';
    if (
      (queryType === 'CUSTOM_ORDER' || queryType === 'APPOINTMENT') &&
      referenceImages.length < 1
    )
      errs.referenceImages = 'At least one reference image is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const buildPayload = () => ({
    type: queryType,
    customerName: customerName.trim(),
    countryCode,
    mobile: mobile.replace(/\s+/g, ''),
    instagram: instagram.trim() || undefined,
    preferredDate: preferredDate || undefined,
    preferredTime: preferredTime || undefined,
    orderType,
    address: needsAddress ? address.trim() : '',
    ...(queryType === 'SHOP_ORDER' && { productId: selectedProductId }),
    // ✅ Map image objects to plain URL strings for backend validation
    referenceImages: referenceImages.map((i) => i.secure_url),
    descriptionImages: descriptionImages.map((i) => i.secure_url),
    descriptionText: descriptionText.trim() || undefined,
  });

  const handleSubmit = async () => {
    if (!validate()) return;
    const payload = buildPayload();
    setPendingPayload(payload);
    setSubmitting(true);
    try {
      await api.post('/tenant/queries', payload);
      onCreated();
    } catch (err) {
      if (err?.response?.data?.code === 'DUPLICATE_QUERY') {
        setDuplicateQueryId(err.response.data.existingQueryId);
      } else {
        toast.error('Failed to create query');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDuplicateUpdate = async () => {
    if (!duplicateQueryId || !pendingPayload) return;
    setUpdatingDuplicate(true);
    try {
      await api.post(`/tenant/queries/${duplicateQueryId}/update`, pendingPayload);
      toast.success('Existing request updated');
      onCreated();
    } catch {
      toast.error('Failed to update query');
    } finally {
      setUpdatingDuplicate(false);
      setDuplicateQueryId(null);
    }
  };

  const orderTypeOptions = getOrderTypeOptions();

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        style={{ background: 'rgba(0,0,0,0.5)' }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-lg max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-2">
              {step === 2 && (
                <button
                  onClick={() => { setStep(1); setOrderType(''); }}
                  className="text-gray-400 hover:text-gray-600 mr-1 text-lg leading-none"
                >
                  ‹
                </button>
              )}
              <h2 className="text-base font-semibold text-gray-900">
                {step === 1
                  ? 'New Query'
                  : `New ${TYPE_OPTIONS.find((t) => t.key === queryType)?.label}`}
              </h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {step === 1 ? (
             <div className="space-y-3">
                <p className="text-sm text-gray-500 mb-4">What type of query would you like to create?</p>
                {!tenantConfig ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : null}
                {TYPE_OPTIONS.filter(({ key }) => {
                  if (!tenantConfig) return false;
                  const wc = tenantConfig.websiteConfig || {};
                  if (key === 'APPOINTMENT' && wc.appointmentEnabled === false) return false;
                  return true;
                }).map(({ key, icon: Icon, label, desc, border, text, iconBg }) => (
                  <button
                    key={key}
                    onClick={() => { setQueryType(key); setOrderType(''); setStep(2); }}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all hover:scale-[1.01] ${border}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                      <Icon className={`w-5 h-5 ${text}`} />
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${text}`}>{label}</p>
                      <p className="text-xs text-gray-500">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Customer name */}
                <Field label="Customer Name" required error={errors.customerName}>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Full name"
                    className={inputClass}
                  />
                </Field>

                {/* Mobile */}
                <Field label="Mobile Number" required error={errors.mobile}>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="px-2 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 flex-shrink-0"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>{c.label}</option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="Mobile number"
                      className={inputClass}
                    />
                  </div>
                </Field>

                {/* Instagram */}
                <Field label="Instagram (optional)">
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@username"
                    className={inputClass}
                  />
                </Field>

                {/* Product selector — Shop Order only */}
                {queryType === 'SHOP_ORDER' && (
                  <Field label="Product" required error={errors.productId}>
                    <ProductSelector
                      products={products}
                      loading={productsLoading}
                      selectedId={selectedProductId}
                      onChange={setSelectedProductId}
                      error={errors.productId}
                    />
                  </Field>
                )}

                {/* Order type */}
                <Field label="Order Type" required error={errors.orderType}>
                  <div className="flex flex-wrap gap-2">
                    {orderTypeOptions.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">Loading options…</p>
                    ) : (
                      orderTypeOptions.map(({ value, label }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => {
                            setOrderType(value);
                            if (value !== 'delivery' && value !== 'at_home') setAddress('');
                          }}
                          className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                            orderType === value
                              ? 'border-violet-400 bg-violet-50 text-violet-700'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {label}
                        </button>
                      ))
                    )}
                  </div>
                </Field>

                {/* Price preview after product + order type selected */}
                {queryType === 'SHOP_ORDER' && selectedProduct && orderType && selectedProductPrice != null && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-violet-50 border border-violet-100 rounded-lg">
                    <span className="text-xs text-gray-500">Current price:</span>
                    {selectedProduct.discount?.isActive ? (
                      <>
                        <span className="text-xs line-through text-gray-400">
                          ₹{orderType === 'delivery' || orderType === 'pickup'
                            ? selectedProduct.discount.originalDeliveryPrice
                            : selectedProduct.discount.originalAppointmentPrice}
                        </span>
                        <span className="text-sm font-semibold text-green-600">
                          ₹{selectedProductPrice}
                        </span>
                        <span className="text-xs text-green-500 bg-green-50 px-1.5 py-0.5 rounded-full">
                          Discounted
                        </span>
                      </>
                    ) : (
                      <span className="text-sm font-semibold text-gray-800">
                        ₹{selectedProductPrice}
                      </span>
                    )}
                  </div>
                )}

                {/* Address — conditional */}
                {needsAddress && (
                  <Field label="Address" required error={errors.address}>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Full delivery address"
                      rows={2}
                      className={inputClass}
                    />
                  </Field>
                )}

                {/* Reference images */}
                {(queryType === 'CUSTOM_ORDER' || queryType === 'APPOINTMENT') && (
                  <AdminImageUpload
                    label="Reference Images"
                    images={referenceImages}
                    onChange={setReferenceImages}
                    maxImages={3}
                    required
                    error={errors.referenceImages}
                  />
                )}

                {/* Preferred date + time */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Preferred Date">
                    <input
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Preferred Time">
                    <input
                      type="time"
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                </div>

                {/* Description */}
                <Field label="Description (optional)">
                  <textarea
                    value={descriptionText}
                    onChange={(e) => setDescriptionText(e.target.value)}
                    placeholder="Any notes or special requests…"
                    rows={3}
                    maxLength={500}
                    className={inputClass}
                  />
                </Field>

                {/* Description images */}
                <AdminImageUpload
                  label="Description Images (optional)"
                  images={descriptionImages}
                  onChange={setDescriptionImages}
                  maxImages={2}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          {step === 2 && (
            <div className="flex gap-3 px-5 py-4 border-t border-gray-100 flex-shrink-0">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: 'var(--color-primary)' }}
              >
                {submitting ? 'Creating…' : 'Create Query'}
              </button>
            </div>
          )}
        </div>
      </div>

      {duplicateQueryId && (
        <AdminDuplicateDialog
          onUpdate={handleDuplicateUpdate}
          onCancel={() => { setDuplicateQueryId(null); setPendingPayload(null); }}
          isUpdating={updatingDuplicate}
        />
      )}
    </>
  );
}