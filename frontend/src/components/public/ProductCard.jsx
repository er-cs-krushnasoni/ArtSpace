import { ShoppingBag } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';

export const getEffectivePrices = (product) => {
  const { discount } = product;
  const baseDelivery = discount?.isActive
    ? discount.originalDeliveryPrice
    : product.deliveryPrice;
  const baseAppointment = discount?.isActive
    ? discount.originalAppointmentPrice
    : product.appointmentPrice;

  // Use the product-level enabled flags as the authoritative gate
  const offersDelivery =
    !!product.deliveryEnabled &&
    baseDelivery !== null &&
    baseDelivery !== undefined;
  const offersAppointment =
    !!product.appointmentEnabled &&
    baseAppointment !== null &&
    baseAppointment !== undefined;

  if (!discount?.isActive) {
    return {
      delivery: baseDelivery,
      appointment: baseAppointment,
      offersDelivery,
      offersAppointment,
      hasDiscount: false,
    };
  }

  const calc = (orig) => {
    if (orig === null || orig === undefined) return null;
    if (discount.type === 'percentage') return Math.round(orig * (1 - discount.value / 100));
    return Math.max(0, orig - discount.value);
  };

  return {
    delivery: offersDelivery ? calc(baseDelivery) : null,
    appointment: offersAppointment ? calc(baseAppointment) : null,
    originalDelivery: baseDelivery,
    originalAppointment: baseAppointment,
    offersDelivery,
    offersAppointment,
    hasDiscount: true,
    discountLabel:
      discount.type === 'percentage'
        ? `${discount.value}% OFF`
        : `−₹${discount.value}`,
  };
};

const PriceRow = ({ label, original, effective, hasDiscount, show }) => {
  if (!show) return null;
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500 text-xs">{label}</span>
      <div className="flex items-center gap-1.5">
        {hasDiscount && original !== null && (
          <span className="text-gray-400 line-through text-xs">₹{original}</span>
        )}
        <span
  className="font-semibold text-sm"
  style={{ color: 'var(--tenant-accent)' }}
>
  {effective === 0 ? 'Free' : `₹${effective}`}
</span>
      </div>
    </div>
  );
};

const ProductCard = ({ product, onClick }) => {
  const { tenant } = useTenant();
  const config = tenant?.websiteConfig || {};
  const prices = getEffectivePrices(product);

  // A price row is shown only if:
  // 1. Global toggle is enabled AND
  // 2. This product actually offers that option
  const showDelivery = !!config.deliveryEnabled && prices.offersDelivery;
  const showAppointment = !!config.appointmentEnabled && prices.offersAppointment;

  const coverPhoto = product.photos?.[0]?.url;

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
      onClick={onClick}
    >
      {/* Photo */}
      <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
        {coverPhoto ? (
          <img
            src={coverPhoto}
            alt={product.nameVisible ? product.name : 'Product'}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag size={40} className="text-gray-200" />
          </div>
        )}
        {/* Discount badge */}
        {prices.hasDiscount && (
          <span
  className="absolute top-2 left-2 text-white text-xs font-semibold px-2 py-0.5 rounded-full"
  style={{ background: 'var(--tenant-accent)' }}
>
            {prices.discountLabel}
          </span>
        )}
        {/* Hover Order Now overlay — desktop */}
        <div className="absolute bottom-0 inset-x-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200 hidden sm:block">
          <button
            className="w-full py-2 rounded-full text-white text-xs font-semibold shadow-lg"
style={{ background: 'var(--tenant-accent)' }}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
          >
            Order Now
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        {product.nameVisible && (
          <p
            className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {product.name}
          </p>
        )}

        {/* Description snippet */}
        {product.description && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        <PriceRow
          label="Delivery"
          original={prices.originalDelivery}
          effective={prices.delivery}
          hasDiscount={prices.hasDiscount}
          show={showDelivery}
        />
        <PriceRow
          label="Appointment"
          original={prices.originalAppointment}
          effective={prices.appointment}
          hasDiscount={prices.hasDiscount}
          show={showAppointment}
        />

        {/* Mobile Order Now */}
        <button
          className="sm:hidden w-full py-2 rounded-full text-white text-xs font-semibold mt-1"
          style={{ background: 'var(--tenant-primary)' }}
          onClick={(e) => { e.stopPropagation(); onClick(); }}
        >
          Order Now
        </button>
      </div>
    </div>
  );
};

export default ProductCard;