import { useState } from 'react';
import { Phone, MessageCircle, ExternalLink, MapPin, Calendar, Trash2, CheckCheck, BookmarkPlus, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import AdminProductPreviewModal from '../common/AdminProductPreviewModal';

const TYPE_BADGE = {
  SHOP_ORDER: { label: 'Shop Order', className: 'bg-violet-100 text-violet-800' },
  CUSTOM_ORDER: { label: 'Custom Order', className: 'bg-pink-100 text-pink-800' },
  APPOINTMENT: { label: 'Appointment', className: 'bg-blue-100 text-blue-800' },
};

const ORDER_TYPE_LABEL = {
  delivery: 'Delivery',
  pickup: 'Pickup',
  at_home: 'At Home',
  at_shop: 'At Shop',
};

const ORDER_TYPE_STYLE = {
  delivery: 'bg-emerald-50 text-emerald-700',
  pickup: 'bg-gray-100 text-gray-600',
  at_home: 'bg-blue-50 text-blue-700',
  at_shop: 'bg-gray-100 text-gray-600',
};

const formatMobile = (countryCode, mobile) => `${countryCode || ''}${mobile || ''}`;
const stripPlus = (code) => (code || '').replace('+', '');

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch { return null; }
};

const timeAgo = (dateStr) => {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch { return ''; }
};

const DeleteConfirm = ({ onConfirm, onCancel }) => (
  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm">
    <span className="text-red-700 flex-1">Delete this query? This cannot be undone.</span>
    <button
      onClick={onConfirm}
      className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors"
    >
      Delete
    </button>
    <button
      onClick={onCancel}
      className="px-3 py-1 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
    >
      Cancel
    </button>
  </div>
);

const LockedPrice = ({ query }) => {
  const { orderType, lockedDeliveryPrice, lockedAppointmentPrice, type } = query;
  if (type === 'CUSTOM_ORDER' || type === 'APPOINTMENT') {
    return <span className="text-xs text-gray-400 italic">Price TBD</span>;
  }
  if (orderType === 'delivery' || orderType === 'pickup') {
    return lockedDeliveryPrice != null ? (
      <span className="text-xs font-semibold text-gray-700">&#8377;{lockedDeliveryPrice}</span>
    ) : null;
  }
  if (orderType === 'at_shop' || orderType === 'at_home') {
    return lockedAppointmentPrice != null ? (
      <span className="text-xs font-semibold text-gray-700">&#8377;{lockedAppointmentPrice}</span>
    ) : null;
  }
  return null;
};

export default function QueryCard({ query, onMarkSeen, onReplyLater, onMarkUnread, onDelete, onConfirm }) {
const [showDeleteConfirm,  setShowDeleteConfirm]  = useState(false);
const [showProductPreview, setShowProductPreview] = useState(false);
  const {
    _id, type, status, createdBy, createdAt,
    customerName, mobile, countryCode, instagram,
    orderType, preferredDate, preferredTime,
    descriptionText, referenceImages, descriptionImages,
    productId,
  } = query;

  const badge = TYPE_BADGE[type] || TYPE_BADGE.SHOP_ORDER;
  const whatsappNum = `${stripPlus(countryCode)}${mobile}`;
  const fullMobile = formatMobile(countryCode, mobile);

  const product = productId;
  const productThumb = product?.photos?.[0]?.url;
  const productName = product?.nameVisible !== false ? product?.name : null;

  return (
    <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-4 transition-all duration-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center flex-wrap gap-1.5">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
            {badge.label}
          </span>
          {createdBy === 'admin' && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
              Created by Admin
            </span>
          )}
          {orderType && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ORDER_TYPE_STYLE[orderType] || 'bg-gray-100 text-gray-600'}`}>
              {ORDER_TYPE_LABEL[orderType] || orderType}
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
          {timeAgo(createdAt)}
        </span>
      </div>

      <div className="mb-3">
        <p className="text-sm font-semibold text-gray-900">{customerName}</p>
        <p className="text-xs text-gray-500">{fullMobile}</p>
      </div>

      {product && (
  <button
    onClick={() => setShowProductPreview(true)}
    className="w-full flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded-lg hover:bg-violet-50 transition-colors text-left"
  >
    {productThumb && (
      <img src={productThumb} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
    )}
    <div className="min-w-0 flex-1">
      {productName && (
        <p className="text-xs font-medium text-gray-800 truncate">{productName}</p>
      )}
      <LockedPrice query={query} />
    </div>
    <ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0" />
  </button>
)}

      {!product && type === 'SHOP_ORDER' && (
        <div className="mb-2">
          <LockedPrice query={query} />
        </div>
      )}

      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3 text-xs text-gray-500">
        {preferredDate && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(preferredDate)}
            {preferredTime && ` · ${preferredTime}`}
          </span>
        )}
        {query.address && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span className="truncate max-w-[200px]">{query.address}</span>
          </span>
        )}
      </div>

      {descriptionText && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
          {descriptionText}
        </p>
      )}

      {(referenceImages?.length > 0 || descriptionImages?.length > 0) && (
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {[...(referenceImages || []), ...(descriptionImages || [])].slice(0, 4).map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer">
              <img
                src={url}
                alt=""
                className="w-12 h-12 rounded-lg object-cover border border-gray-200 hover:opacity-80 transition-opacity"
              />
            </a>
          ))}
        </div>
      )}

      <div className="border-t border-gray-100 pt-3 mt-1">
  {showDeleteConfirm ? (
    <DeleteConfirm
      onConfirm={() => { setShowDeleteConfirm(false); onDelete(_id); }}
      onCancel={() => setShowDeleteConfirm(false)}
    />
  ) : (
    <div className="flex flex-wrap items-center gap-2">
      {/* Contact buttons */}
      <div className="flex items-center gap-1.5 mr-1">
        <a href={`tel:${fullMobile}`}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
          <Phone className="w-3 h-3" />Call
        </a>
        <a href={`https://wa.me/${whatsappNum}`} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors">
          <MessageCircle className="w-3 h-3" />WhatsApp
        </a>
        {instagram && (
          <a href={`https://instagram.com/${instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-pink-50 text-pink-700 hover:bg-pink-100 transition-colors">
            <ExternalLink className="w-3 h-3" />Instagram
          </a>
        )}
      </div>
      <div className="flex-1" />
      {/* Status actions */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Unread: can reply later or mark seen */}
        {status === 'unread' && (
          <button onClick={() => onReplyLater(_id)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <BookmarkPlus className="w-3 h-3" />Reply Later
          </button>
        )}
        {/* Reply Later: can move back to unread */}
        {status === 'reply_later' && (
          <button onClick={() => onMarkUnread(_id)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <BookmarkPlus className="w-3 h-3" />Move to Unread
          </button>
        )}
        {/* Seen: can move back to unread or reply later */}
        {status === 'seen' && (
          <>
            <button onClick={() => onMarkUnread(_id)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
              Move to Unread
            </button>
            <button onClick={() => onReplyLater(_id)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
              <BookmarkPlus className="w-3 h-3" />Reply Later
            </button>
          </>
        )}
        <button onClick={() => setShowDeleteConfirm(true)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors">
          <Trash2 className="w-3 h-3" />Delete
        </button>
        {/* Mark as seen — only for unread and reply_later */}
        {(status === 'unread' || status === 'reply_later') && (
          <button onClick={() => onMarkSeen(_id)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors"
            style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>
            <CheckCheck className="w-3 h-3" />Mark as Seen
          </button>
        )}
        <button onClick={() => onConfirm(query)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all duration-200 hover:opacity-90"
          style={{ background: 'var(--color-primary)' }}>
          Confirm Order<ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  )}
      </div>
      {showProductPreview && product && (
  <AdminProductPreviewModal
    product={product}
    onClose={() => setShowProductPreview(false)}
  />
)}
    </div>
  );
}