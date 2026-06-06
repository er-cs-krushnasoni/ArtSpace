import { Edit2, Tag, Percent, Trash2, ImageIcon, Eye, EyeOff } from 'lucide-react';

export default function ProductCard({ product, deliveryEnabled = true, appointmentEnabled = true, onEdit, onDiscount, onDelete, selected = false, onSelect }) {  const {
    name,
    nameVisible,
    photos,
    deliveryPrice,
    appointmentPrice,
    categories,
    isActive,
    discount,
  } = product;

  const firstPhoto = photos?.[0]?.url || null;
  const discountActive = discount?.isActive;

  // Build discount badge label
  let discountLabel = '';
  if (discountActive) {
    discountLabel = discount.type === 'percentage'
      ? `${discount.value}% OFF`
      : `−₹${discount.value}`;
  }

  const visibleCats = categories?.slice(0, 2) || [];
  const extraCats = (categories?.length || 0) - 2;

  return (
    <div
      className={`bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col transition-all duration-200 hover:shadow-md cursor-pointer ${
        selected ? 'border-violet-400 ring-2 ring-violet-300' : 'border-gray-100'
      }`}
      onClick={() => onSelect && onSelect(product)}
    >
      {/* Photo */}
      <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
        {firstPhoto ? (
          <img src={firstPhoto} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-10 h-10 text-gray-300" />
          </div>
        )}
        {/* Selection checkbox */}
        {onSelect && (
          <div className="absolute top-2 left-2 z-10">
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                selected
                  ? 'bg-violet-600 border-violet-600'
                  : 'bg-white/80 border-gray-400'
              }`}
            >
              {selected && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
        )}
        {/* Discount badge */}
        {discountActive && !onSelect && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500 text-white shadow-sm">
            {discountLabel}
          </span>
        )}
        {discountActive && onSelect && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500 text-white shadow-sm">
            {discountLabel}
          </span>
        )}
        {/* Status badge */}
        {!isActive && (
          <span className={`absolute ${onSelect ? 'bottom-2 right-2' : 'top-2 right-2'} px-2 py-0.5 rounded-full text-xs font-medium bg-gray-700/80 text-white`}>
            Inactive
          </span>
        )}
      </div>
      {/* Info */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        {/* Name */}
        <div className="flex items-center gap-1.5">
          {nameVisible ? (
            <p className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2">{name}</p>
          ) : (
            <p className="text-sm italic text-gray-400 leading-tight flex items-center gap-1">
              <EyeOff className="w-3 h-3" />
              Name hidden
            </p>
          )}
        </div>
        {/* Prices */}
        <div className="flex flex-col gap-1 text-xs text-gray-500">
          {deliveryEnabled && (
            <div className="flex items-center gap-1.5">
              {discountActive ? (
                <>
                  <span className="line-through text-gray-400">₹{discount.originalDeliveryPrice}</span>
                  <span className="font-semibold text-gray-900">₹{deliveryPrice}</span>
                  <span className="text-green-600 font-medium">delivery</span>
                </>
              ) : (
                <>
                  <span className="font-medium text-gray-800">₹{deliveryPrice}</span>
                  <span>delivery</span>
                </>
              )}
            </div>
          )}
          {appointmentEnabled && (
            <div className="flex items-center gap-1.5">
              {discountActive ? (
                <>
                  <span className="line-through text-gray-400">₹{discount.originalAppointmentPrice}</span>
                  <span className="font-semibold text-gray-900">₹{appointmentPrice}</span>
                  <span className="text-green-600 font-medium">appt</span>
                </>
              ) : (
                <>
                  <span className="font-medium text-gray-800">₹{appointmentPrice}</span>
                  <span>appt</span>
                </>
              )}
            </div>
          )}
          {discountActive && (
            <>
              <div className="text-green-600 font-medium">
                Save ₹{
                  (deliveryEnabled ? (discount.originalDeliveryPrice - deliveryPrice) : 0) +
                  (appointmentEnabled ? (discount.originalAppointmentPrice - appointmentPrice) : 0)
                }
              </div>
              {discount.endDate && (
                <div className="text-xs text-amber-600 flex items-center gap-1 mt-0.5">
                  <span>Until {new Date(discount.endDate).toLocaleString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit', hour12: true,
                  })}</span>
                </div>
              )}
            </>
          )}
        </div>
        {/* Categories */}
        {visibleCats.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {visibleCats.map((cat) => (
              <span key={cat._id} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-500">
                <Tag className="w-2.5 h-2.5" />
                {cat.groupName}
              </span>
            ))}
            {extraCats > 0 && (
              <span className="px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-400">+{extraCats} more</span>
            )}
          </div>
        )}
        {/* Actions */}
        <div className="mt-auto pt-2 border-t border-gray-50 space-y-1.5">
  <div className="flex gap-1.5">
    <button
      onClick={(e) => { e.stopPropagation(); onEdit(product); }}
      className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
    >
      <Edit2 className="w-3 h-3" />
      Edit
    </button>
    <button
      onClick={(e) => { e.stopPropagation(); onDelete(product); }}
      className="flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-500 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-200 transition-all"
    >
      <Trash2 className="w-3 h-3" />
    </button>
  </div>
  <button
    onClick={(e) => { e.stopPropagation(); onDiscount(product); }}
    className="w-full flex items-center justify-center gap-1 py-1.5 text-xs font-medium rounded-lg border transition-all"
    style={
      discountActive
        ? { background: '#fef3c7', color: '#92400e', borderColor: '#fde68a' }
        : { color: '#6d28d9', borderColor: '#ede9fe', background: '#ede9fe' }
    }
  >
    <Percent className="w-3 h-3" />
    {discountActive ? 'Edit Discount' : 'Add Discount'}
  </button>
</div>
      </div>
    </div>
  );
}