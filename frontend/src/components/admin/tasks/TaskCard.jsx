import { useState } from 'react';
import {
  ChevronDown, ChevronUp, Phone, MessageCircle, ExternalLink,
  MapPin, Calendar, Clock, Trash2, Package, FileText, StickyNote, CheckCircle2,
} from 'lucide-react';
import PaymentPanel from './PaymentPanel';
import StatusTransitionButtons from './StatusTransitionButtons';
import RescheduleModal from './RescheduleModal';
import AdminProductPreviewModal from '../common/AdminProductPreviewModal';
import api from '../../../api/axiosInstance';
import toast from 'react-hot-toast';

const STATUS_PILL = {
  pending:    'bg-gray-100 text-gray-700',
  processing: 'bg-amber-100 text-amber-800',
  ready:      'bg-blue-100 text-blue-800',
  completed:  'bg-green-100 text-green-800',
  cancelled:  'bg-red-100 text-red-800',
};
const STATUS_LABEL = {
  pending: 'Pending', processing: 'Processing', ready: 'Ready',
  completed: 'Completed', cancelled: 'Cancelled',
};
const TYPE_PILL = {
  delivery:    'bg-emerald-50 text-emerald-700',
  appointment: 'bg-blue-50 text-blue-700',
};
const PAYMENT_PILL = {
  full:    'bg-green-100 text-green-800',
  partial: 'bg-yellow-100 text-yellow-800',
  none:    'bg-red-100 text-red-800',
};
const PAYMENT_LABEL = { full: 'Full Paid', partial: 'Partial', none: 'No Payment' };
const ORDER_TYPE_LABEL = {
  delivery: 'Delivery', pickup: 'Pickup', at_home: 'At Home', at_shop: 'At Shop',
};

const fmtDate = (d) => {
  if (!d) return null;
  try {
    return new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch { return null; }
};
const stripPlus = (c) => (c || '').replace('+', '');

const DeleteConfirm = ({ onConfirm, onCancel }) => (
  <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-100 rounded-lg text-sm mt-2">
    <span className="text-red-700 flex-1 text-xs">Delete this task permanently?</span>
    <button onClick={onConfirm} className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700">
      Delete
    </button>
    <button onClick={onCancel} className="px-2.5 py-1 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50">
      Cancel
    </button>
  </div>
);

export default function TaskCard({ task: initialTask, onDeleted }) {
  const [task,               setTask]               = useState(initialTask);
  const [expanded,           setExpanded]           = useState(false);
  const [showDelete,         setShowDelete]         = useState(false);
  const [showReschedule,     setShowReschedule]     = useState(false);
  const [showProductPreview, setShowProductPreview] = useState(false);
  const [editingNotes,       setEditingNotes]       = useState(false);
  const [notesInput,         setNotesInput]         = useState(task.adminNotes || '');
  const [savingNotes,        setSavingNotes]        = useState(false);

  const {
    _id, customerName, mobile, countryCode, instagram,
    type, orderType, address, taskStatus, paymentStatus, finalPrice,
    scheduledDate, scheduledTime, productId,
    referenceImages, descriptionImages, descriptionText,
    adminNotes,
  } = task;

  const product      = productId;
  const productThumb = product?.photos?.[0]?.url;
  const productName  = product?.nameVisible !== false ? product?.name : null;
  const whatsappNum  = `${stripPlus(countryCode)}${mobile}`;
  const fullMobile   = `${countryCode || ''}${mobile || ''}`;
  const allImages    = [...(referenceImages || []), ...(descriptionImages || [])];

  const handleDelete = async () => {
    try {
      await api.delete(`/tenant/tasks/${_id}`);
      toast.success('Task deleted');
      onDeleted(_id);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await api.patch(`/tenant/tasks/${_id}/notes`, { adminNotes: notesInput });
      setTask((t) => ({ ...t, adminNotes: notesInput }));
      setEditingNotes(false);
      toast.success('Notes saved');
    } catch {
      toast.error('Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-100 shadow-sm rounded-xl transition-all duration-200 hover:shadow-md overflow-hidden">

        {/* ── Collapsed header ─────────────────────────────────────── */}
        <button className="w-full text-left px-4 py-3" onClick={() => setExpanded((v) => !v)}>
          <div className="flex items-center justify-between gap-2">
            {/* Pills */}
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_PILL[taskStatus]}`}>
                {STATUS_LABEL[taskStatus]}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${TYPE_PILL[type]}`}>
                {type === 'delivery' ? 'Delivery' : 'Appointment'}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PAYMENT_PILL[paymentStatus]}`}>
                {PAYMENT_LABEL[paymentStatus]}
              </span>
            </div>
            {/* Right: completion date or scheduled date */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {task.completedTimestamp ? (
                <span className="text-xs text-green-600 hidden sm:block">
                  Done {fmtDate(task.completedTimestamp)}
                </span>
              ) : scheduledDate ? (
                <span className="text-xs text-gray-400 hidden sm:block">
                  {fmtDate(scheduledDate)}
                </span>
              ) : null}
              {expanded
                ? <ChevronUp className="w-4 h-4 text-gray-400" />
                : <ChevronDown className="w-4 h-4 text-gray-400" />
              }
            </div>
          </div>
          {/* Customer name + mobile */}
          <div className="mt-1.5">
            <p className="text-sm font-semibold text-gray-900 truncate">{customerName}</p>
            <p className="text-xs text-gray-500">{fullMobile}</p>
          </div>
          {/* Product name preview */}
          {productName && (
            <p className="text-xs text-gray-400 mt-1 truncate flex items-center gap-1">
              <Package className="w-3 h-3" />{productName}
            </p>
          )}
        </button>

        {/* ── Expanded body ─────────────────────────────────────────── */}
        {expanded && (
          <div className="px-4 pb-4 space-y-4 border-t border-gray-50">

            {/* Customer contact */}
            <section className="pt-3">
              <div className="flex items-center gap-2 flex-wrap">
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
              {address && (
                <p className="flex items-start gap-1 text-xs text-gray-500 mt-2">
                  <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />{address}
                </p>
              )}
            </section>

            {/* Order details */}
            <section>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Order</p>
              <div className="space-y-1.5">
                {orderType && (
                  <p className="text-xs text-gray-600">
                    Type: <span className="font-medium text-gray-800">{ORDER_TYPE_LABEL[orderType] || orderType}</span>
                  </p>
                )}
                {finalPrice && (
                  <p className="text-xs text-gray-600">
                    Final Price: <span className="font-semibold text-gray-900">₹{finalPrice.toLocaleString('en-IN')}</span>
                  </p>
                )}
                {product && (
                  <button
                    onClick={() => setShowProductPreview(true)}
                    className="w-full flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-violet-50 transition-colors text-left mt-1"
                  >
                    {productThumb && (
                      <img src={productThumb} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    )}
                    {productName && (
                      <p className="text-xs font-medium text-gray-800 truncate flex-1">{productName}</p>
                    )}
                    <ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  </button>
                )}
              </div>
            </section>

            {/* Customer request content */}
            {(descriptionText || allImages.length > 0) && (
              <section>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <FileText className="w-3 h-3" />Customer Request
                </p>
                {descriptionText && (
                  <p className="text-xs text-gray-600 leading-relaxed mb-2">{descriptionText}</p>
                )}
                {allImages.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {allImages.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                        <img src={url} alt=""
                          className="w-14 h-14 rounded-lg object-cover border border-gray-200 hover:opacity-80 transition-opacity" />
                      </a>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Admin notes */}
            <section>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                <StickyNote className="w-3 h-3" />Admin Notes
              </p>
              {editingNotes ? (
                <div className="space-y-2">
                  <textarea
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    rows={3}
                    placeholder="Add notes about this task…"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveNotes}
                      disabled={savingNotes}
                      className="px-3 py-1.5 text-xs font-semibold text-white rounded-lg disabled:opacity-60 hover:opacity-90"
                      style={{ background: 'var(--color-primary)' }}
                    >
                      {savingNotes ? 'Saving…' : 'Save Notes'}
                    </button>
                    <button
                      onClick={() => { setEditingNotes(false); setNotesInput(adminNotes || ''); }}
                      className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setEditingNotes(true)}
                  className="w-full text-left p-2.5 rounded-lg border border-dashed border-gray-200 hover:border-violet-300 hover:bg-violet-50/30 transition-colors"
                >
                  {adminNotes
                    ? <p className="text-xs text-gray-700 leading-relaxed">{adminNotes}</p>
                    : <p className="text-xs text-gray-400 italic">Tap to add notes…</p>
                  }
                </button>
              )}
            </section>

            {/* Payment */}
            <PaymentPanel task={task} onUpdate={(updated) => setTask(updated)} />

            {/* Schedule */}
            <section>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Schedule</p>
              {scheduledDate || scheduledTime ? (
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  {scheduledDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />{fmtDate(scheduledDate)}
                    </span>
                  )}
                  {scheduledTime && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />{scheduledTime}
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">Not scheduled yet</p>
              )}
              <button
                onClick={() => setShowReschedule(true)}
                className="mt-2 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors hover:bg-gray-50"
                style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
              >
                <Calendar className="w-3 h-3" />
                {scheduledDate ? 'Change Schedule' : 'Set Schedule'}
              </button>
              {/* Completion timestamp */}
              {task.completedTimestamp && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-green-600">
                  <CheckCircle2 className="w-3 h-3" />
                  Completed on {fmtDate(task.completedTimestamp)}
                  {task.completedAt
                    ? ' · 7-day deletion timer started'
                    : ' · Waiting for full payment to start timer'
                  }
                </div>
              )}
            </section>

            {/* Status transitions */}
            <section>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Status</p>
              <StatusTransitionButtons task={task} onUpdate={(updated) => setTask(updated)} />
              {!showDelete ? (
                <button
                  onClick={() => setShowDelete(true)}
                  className="mt-3 flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />Delete task
                </button>
              ) : (
                <DeleteConfirm onConfirm={handleDelete} onCancel={() => setShowDelete(false)} />
              )}
            </section>

          </div>
        )}
      </div>

      {/* Modals */}
      {showReschedule && (
        <RescheduleModal
          task={task}
          onClose={() => setShowReschedule(false)}
          onUpdate={(updated) => { setTask(updated); setShowReschedule(false); }}
        />
      )}
      {showProductPreview && product && (
        <AdminProductPreviewModal
          product={product}
          onClose={() => setShowProductPreview(false)}
        />
      )}
    </>
  );
}