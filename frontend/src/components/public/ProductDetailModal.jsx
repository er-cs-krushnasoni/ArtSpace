import { useState } from 'react';
import { X, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTenant } from '../../context/TenantContext';
import { getEffectivePrices } from './ProductCard';

const ProductDetailModal = ({ product, onClose }) => {
  const { tenant } = useTenant();
  const [activePhoto, setActivePhoto] = useState(0);
  const config = tenant?.websiteConfig || {};
  const prices = getEffectivePrices(product);

  const photos = product.photos || [];

  // Flatten categories for display
  const categoryTags = [];
  if (product.categories) {
    product.categories.forEach((cat) => {
      if (cat.values) {
        cat.values.forEach((val) => categoryTags.push({ group: cat.groupName, value: val }));
      }
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3
            className="font-semibold text-gray-900 text-base"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {product.nameVisible ? product.name : 'Product Details'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Photo gallery */}
          {photos.length > 0 && (
            <div className="space-y-2">
              {/* Main photo */}
              <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-50">
                <img
                  src={photos[activePhoto]?.url}
                  alt={product.nameVisible ? product.name : 'Product'}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnails */}
              {photos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {photos.map((photo, i) => (
                    <button
                      key={i}
                      onClick={() => setActivePhoto(i)}
                      className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all"
                      style={{
                        borderColor: i === activePhoto ? 'var(--tenant-primary)' : 'transparent',
                      }}
                    >
                      <img src={photo.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {product.description && (
            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
          )}

          {/* Prices */}
          {/* Prices */}
          <div className="space-y-2">
            {config.deliveryEnabled && prices.offersDelivery && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Delivery Price</p>
                  <div className="flex items-center gap-2">
                    {prices.hasDiscount && (
                      <span className="text-gray-400 line-through text-sm">₹{prices.originalDelivery}</span>
                    )}
                    <span className="font-semibold text-gray-900">
                      {prices.delivery === 0 ? 'Free' : `₹${prices.delivery}`}
                    </span>
                    {prices.hasDiscount && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {prices.discountLabel}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {config.appointmentEnabled && prices.offersAppointment && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Appointment Price</p>
                  <div className="flex items-center gap-2">
                    {prices.hasDiscount && (
                      <span className="text-gray-400 line-through text-sm">₹{prices.originalAppointment}</span>
                    )}
                    <span className="font-semibold text-gray-900">
                      {prices.appointment === 0 ? 'Free' : `₹${prices.appointment}`}
                    </span>
                    {prices.hasDiscount && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {prices.discountLabel}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Category tags — use accent color */}
          {categoryTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {categoryTags.map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: 'color-mix(in srgb, var(--tenant-accent) 15%, transparent)',
                    color: 'var(--tenant-accent)',
                  }}
                >
                  {tag.value}
                </span>
              ))}
            </div>
          )}

          {/* Category tags */}
          {categoryTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {categoryTags.map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: 'color-mix(in srgb, var(--tenant-primary) 12%, transparent)',
                    color: 'var(--tenant-primary)',
                  }}
                >
                  <Tag size={10} />
                  {tag.value}
                </span>
              ))}
            </div>
          )}

         
          {/* Action buttons */}
          <div className="flex gap-3 pt-1">
            {config.deliveryEnabled && prices.offersDelivery && (
              <button
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: 'var(--tenant-primary)' }}
                onClick={() => toast('Order forms coming soon!')}
              >
                Order / Delivery
              </button>
            )}
            {config.appointmentEnabled && prices.offersAppointment && (
              <button
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition-colors border-2"
                style={{
                  color: 'var(--tenant-primary)',
                  borderColor: 'var(--tenant-primary)',
                  background: 'color-mix(in srgb, var(--tenant-primary) 8%, transparent)',
                }}
                onClick={() => toast('Booking forms coming soon!')}
              >
                Book Appointment
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;