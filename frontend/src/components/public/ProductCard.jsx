// frontend/src/components/public/ProductCard.jsx
import { ShoppingBag } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
// ── Exported utility — used by ProductGrid, ProductDetailModal, etc. ──────────
export const getEffectivePrices = (product) => {
  const { discount } = product;
  const baseDelivery = discount?.isActive
    ? discount.originalDeliveryPrice
    : product.deliveryPrice;
  const baseAppointment = discount?.isActive
    ? discount.originalAppointmentPrice
    : product.appointmentPrice;
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
    applyTo: discount.applyTo,
    discountLabel:
      discount.type === 'percentage'
        ? `${discount.value}% OFF`
        : `−₹${discount.value}`,
  };
};
// ── Internal price row ────────────────────────────────────────────────────────
const PriceRow = ({ label, original, effective, hasDiscount, show }) => {
  if (!show) return null;
  return (
    <div className="flex flex-col gap-0.5">
      {label && (
        <span className="text-gray-400 dark:text-zinc-500 text-xs">{label}</span>
      )}
      <div className="flex items-center gap-1.5">
        {hasDiscount && original !== null && (
          <span className="text-gray-300 dark:text-zinc-600 line-through text-xs">
            ₹{original}
          </span>
        )}
        <span
          className="font-bold text-sm"
          style={{ color: 'var(--tenant-accent)' }}
        >
          {effective === 0 ? 'Free' : `₹${effective}`}
        </span>
      </div>
    </div>
  );
};
// ── ProductCard ───────────────────────────────────────────────────────────────
const ProductCard = ({ product, onClick }) => {
  const { tenant } = useTenant();
  const config = tenant?.websiteConfig || {};
  const prices = getEffectivePrices(product);

  const productSalesEnabled = config.productSalesEnabled !== false;
  const showDelivery    = productSalesEnabled && prices.offersDelivery;
  const showAppointment = !!config.appointmentEnabled && prices.offersAppointment;

  const buttonLabel = showDelivery && showAppointment
    ? 'Order / Book Now'
    : showDelivery
    ? 'Order Now'
    : showAppointment
    ? 'Book Appointment'
    : 'View Details';

  const coverPhoto = product.photos?.[0]?.url;

  return (
    <div
      className="rounded-2xl overflow-hidden cursor-pointer group
                 hover:-translate-y-1 hover:shadow-xl
                 transition-all duration-250 ease-out
                 dark:ring-1 dark:ring-zinc-700/60"
      style={{
        background: 'var(--tenant-card-bg, #ffffff)',
        boxShadow: '0 1px 4px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
      }}
      onClick={onClick}
    >
      {/* Photo */}
      <div className="relative w-full aspect-square bg-gray-50 dark:bg-zinc-800 overflow-hidden">
        {coverPhoto ? (
          <img
            src={coverPhoto}
            alt={product.nameVisible ? product.name : 'Product'}
            className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
            draggable={false}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag size={40} className="text-gray-200 dark:text-zinc-700" />
          </div>
        )}
        {/* Discount badge */}
        {prices.hasDiscount && (
          <span
            className="absolute top-3 left-3 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm"
            style={{ background: 'var(--tenant-accent)' }}
          >
            {prices.discountLabel}
          </span>
        )}
        {/* Desktop hover overlay */}
        <div className="absolute bottom-0 inset-x-0 p-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-200 hidden sm:block">
          <button
            className="w-full py-2.5 rounded-xl text-xs font-bold shadow-lg transition-opacity hover:opacity-90"
            style={{
              background: 'var(--tenant-accent)',
              color: 'var(--tenant-btn-text, #ffffff)',
            }}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
          >
            {buttonLabel}
          </button>
        </div>
      </div>
      {/* Info */}
      <div className="p-3.5 space-y-2">
        {product.nameVisible && (
          <p
            className="font-semibold text-gray-900 dark:text-zinc-100 text-sm leading-snug line-clamp-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {product.name}
          </p>
        )}
        {product.description && (
          <p className="text-xs text-gray-400 dark:text-zinc-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}
        <div className="space-y-1.5 pt-0.5">
          <PriceRow
            label="Price"
            original={prices.originalDelivery}
            effective={prices.delivery}
            hasDiscount={prices.hasDiscount && prices.applyTo !== 'appointment'}
            show={showDelivery}
          />
          {prices.hasDiscount && showDelivery && prices.applyTo !== 'appointment' && (
            <p className="text-xs font-medium text-green-600 text-right">
              Save ₹{prices.originalDelivery - prices.delivery}
            </p>
          )}
          <PriceRow
            label={showDelivery ? 'Appointment Price' : 'Appointment Price'}
            original={prices.originalAppointment}
            effective={prices.appointment}
            hasDiscount={prices.hasDiscount && prices.applyTo !== 'delivery'}
            show={showAppointment}
          />
          {prices.hasDiscount && showAppointment && prices.applyTo !== 'delivery' && (
            <p className="text-xs font-medium text-green-600 text-right">
              Save ₹{prices.originalAppointment - prices.appointment}{showDelivery ? ' on appt' : ''}
            </p>
          )}
        </div>
        {/* Mobile button */}
        <button
          className="sm:hidden w-full py-2.5 rounded-xl text-xs font-bold mt-1 transition-opacity hover:opacity-90"
          style={{
            background: 'var(--tenant-primary)',
            color: 'var(--tenant-btn-text, #ffffff)',
          }}
          onClick={(e) => { e.stopPropagation(); onClick(); }}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
};
export default ProductCard;