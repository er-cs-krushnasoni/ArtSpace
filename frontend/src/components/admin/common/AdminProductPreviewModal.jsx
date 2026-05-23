import { useState } from 'react';
import { X, Tag, Truck, CalendarCheck } from 'lucide-react';

// Replicates getEffectivePrices logic without importing from public components
const getEffectivePrices = (product) => {
  const discount = product.discount;
  const hasDiscount = discount?.isActive;
  return {
    delivery:           product.deliveryPrice ?? 0,
    appointment:        product.appointmentPrice ?? 0,
    originalDelivery:   hasDiscount ? discount.originalDeliveryPrice : product.deliveryPrice,
    originalAppointment:hasDiscount ? discount.originalAppointmentPrice : product.appointmentPrice,
    hasDiscount,
    discountLabel:      hasDiscount
      ? discount.type === 'percentage'
        ? `${discount.value}% off`
        : `₹${discount.value} off`
      : null,
    offersDelivery:    product.deliveryEnabled && product.deliveryPrice != null,
    offersAppointment: product.appointmentEnabled && product.appointmentPrice != null,
  };
};

export default function AdminProductPreviewModal({ product, onClose }) {
  const [activePhoto, setActivePhoto] = useState(0);

  const photos    = product.photos || [];
  const prices    = getEffectivePrices(product);
  const showName  = product.nameVisible !== false;

  const categoryTags = [];
  if (product.categories) {
    product.categories.forEach((cat) => {
      (cat.values || []).forEach((val) =>
        categoryTags.push({ group: cat.groupName, value: val })
      );
    });
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="font-semibold text-gray-900 text-base">
            {showName ? product.name : 'Product Details'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Photo gallery */}
          {photos.length > 0 && (
            <div className="space-y-2">
              <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-50">
                <img
                  src={photos[activePhoto]?.url}
                  alt={showName ? product.name : 'Product'}
                  className="w-full h-full object-cover"
                />
              </div>
              {photos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {photos.map((photo, i) => (
                    <button
                      key={i}
                      onClick={() => setActivePhoto(i)}
                      className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                        i === activePhoto ? 'border-violet-500' : 'border-transparent'
                      }`}
                    >
                      <img src={photo.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Prices */}
          <div className="space-y-2">
            {prices.offersDelivery && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <p className="text-xs text-gray-500">Delivery / Pickup</p>
                </div>
                <div className="flex items-center gap-2">
                  {prices.hasDiscount && (
                    <span className="text-gray-400 line-through text-xs">
                      ₹{prices.originalDelivery}
                    </span>
                  )}
                  <span className="font-semibold text-sm text-gray-900">
                    {prices.delivery === 0 ? 'Free' : `₹${prices.delivery}`}
                  </span>
                  {prices.hasDiscount && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {prices.discountLabel}
                    </span>
                  )}
                </div>
              </div>
            )}
            {prices.offersAppointment && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-blue-600" />
                  <p className="text-xs text-gray-500">Appointment</p>
                </div>
                <div className="flex items-center gap-2">
                  {prices.hasDiscount && (
                    <span className="text-gray-400 line-through text-xs">
                      ₹{prices.originalAppointment}
                    </span>
                  )}
                  <span className="font-semibold text-sm text-gray-900">
                    {prices.appointment === 0 ? 'Free' : `₹${prices.appointment}`}
                  </span>
                  {prices.hasDiscount && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {prices.discountLabel}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Category tags */}
          {categoryTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {categoryTags.map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-violet-50 text-violet-700"
                >
                  <Tag className="w-2.5 h-2.5" />
                  {tag.value}
                </span>
              ))}
            </div>
          )}

          {/* Read-only notice */}
          <p className="text-xs text-center text-gray-400 pt-1">
            Read-only product preview
          </p>
        </div>
      </div>
    </div>
  );
}