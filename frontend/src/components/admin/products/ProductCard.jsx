import { Edit2, Tag, Percent, Trash2, ImageIcon, Eye, EyeOff } from 'lucide-react';

export default function ProductCard({ product, deliveryEnabled = true, appointmentEnabled = true, onEdit, onDiscount, onDelete }) {  const {
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
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden flex flex-col transition-all duration-200 hover:shadow-md">
      {/* Photo */}
      <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
        {firstPhoto ? (
          <img src={firstPhoto} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-10 h-10 text-gray-300" />
          </div>
        )}
        {/* Discount badge */}
        {discountActive && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500 text-white shadow-sm">
            {discountLabel}
          </span>
        )}
        {/* Status badge */}
        {!isActive && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-700/80 text-white">
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
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
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
              <span
                key={cat._id}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-500"
              >
                <Tag className="w-2.5 h-2.5" />
                {cat.groupName}
              </span>
            ))}
            {extraCats > 0 && (
              <span className="px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-400">
                +{extraCats} more
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-gray-50">
          <button
            onClick={() => onEdit(product)}
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            onClick={() => onDiscount(product)}
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded-lg border transition-all"
            style={
              discountActive
                ? { background: '#fef3c7', color: '#92400e', borderColor: '#fde68a' }
                : { color: '#6d28d9', borderColor: '#ede9fe', background: '#ede9fe' }
            }
          >
            <Percent className="w-3.5 h-3.5" />
            {discountActive ? 'Discount' : 'Discount'}
          </button>
          <button
            onClick={() => onDelete(product)}
            className="p-1.5 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-200 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
}