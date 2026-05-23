import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import api from '../../../api/axiosInstance';
import toast from 'react-hot-toast';

const PAYMENT_PILL = {
  full:    'bg-green-100 text-green-800',
  partial: 'bg-yellow-100 text-yellow-800',
  none:    'bg-red-100 text-red-800',
};
const PAYMENT_LABEL = { full: 'Full Paid', partial: 'Partial', none: 'No Payment' };

const fmtDate = (d) => {
  if (!d) return '';
  try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return ''; }
};

const toInputDate = (d) => {
  if (!d) return '';
  try { return new Date(d).toISOString().slice(0, 10); }
  catch { return ''; }
};

// ─── Inline entry form (add or edit) ─────────────────────────────────────────
function EntryForm({ initial, onSave, onCancel, saving }) {
  const [amount, setAmount] = useState(initial?.amount ?? '');
  const [date,   setDate]   = useState(initial?.date ? toInputDate(initial.date) : toInputDate(new Date()));
  const [note,   setNote]   = useState(initial?.note ?? '');

  const handleSave = () => {
    if (!amount || !date) { toast.error('Amount and date are required'); return; }
    onSave({ amount: Number(amount), date, note });
  };

  return (
    <div className="bg-white border border-violet-200 rounded-xl p-3 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Amount (₹)</label>
          <input
            type="number" min="0" value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Date</label>
          <input
            type="date" value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300"
          />
        </div>
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Note (optional)</label>
        <input
          type="text" value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Paid cash at shop"
          className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSave} disabled={saving}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white rounded-lg hover:opacity-90 disabled:opacity-60"
          style={{ background: 'var(--color-primary)' }}
        >
          <Check className="w-3 h-3" />{saving ? 'Saving…' : 'Save'}
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          <X className="w-3 h-3" />Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────
export default function PaymentPanel({ task, onUpdate }) {
  const [editingPrice,  setEditingPrice]  = useState(false);
  const [priceInput,    setPriceInput]    = useState(task.finalPrice ?? '');
  const [savingPrice,   setSavingPrice]   = useState(false);
  const [addingEntry,   setAddingEntry]   = useState(false);
  const [savingEntry,   setSavingEntry]   = useState(false);
  const [editingEntry,  setEditingEntry]  = useState(null); // entryId
  const [deletingEntry, setDeletingEntry] = useState(null);

  // ── Final price ────────────────────────────────────────────────────────────
  const savePrice = async () => {
    setSavingPrice(true);
    try {
      const res = await api.patch(`/tenant/tasks/${task._id}/final-price`, {
        finalPrice: priceInput !== '' ? Number(priceInput) : null,
      });
      onUpdate(res.data.data);
      setEditingPrice(false);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to save price');
    } finally {
      setSavingPrice(false);
    }
  };

  // ── Add entry ──────────────────────────────────────────────────────────────
  const handleAddEntry = async ({ amount, date, note }) => {
    setSavingEntry(true);
    try {
      const res = await api.post(`/tenant/tasks/${task._id}/payment-entries`, { amount, date, note });
      onUpdate(res.data.data);
      setAddingEntry(false);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to add entry');
    } finally {
      setSavingEntry(false);
    }
  };

  // ── Edit entry ─────────────────────────────────────────────────────────────
  const handleEditEntry = async (entryId, { amount, date, note }) => {
    setSavingEntry(true);
    try {
      const res = await api.patch(`/tenant/tasks/${task._id}/payment-entries/${entryId}`, { amount, date, note });
      onUpdate(res.data.data);
      setEditingEntry(null);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to update entry');
    } finally {
      setSavingEntry(false);
    }
  };

  // ── Delete entry ───────────────────────────────────────────────────────────
  const handleDeleteEntry = async (entryId) => {
    setDeletingEntry(entryId);
    try {
      const res = await api.delete(`/tenant/tasks/${task._id}/payment-entries/${entryId}`);
      onUpdate(res.data.data);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to delete entry');
    } finally {
      setDeletingEntry(null);
    }
  };

  const entries = task.paymentEntries || [];

  return (
    <div className="bg-violet-50 rounded-xl p-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-violet-700 uppercase tracking-wide">Payment</p>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PAYMENT_PILL[task.paymentStatus]}`}>
          {PAYMENT_LABEL[task.paymentStatus]}
        </span>
      </div>

      {/* Final price row */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 flex-shrink-0">Final Price:</span>
        {editingPrice ? (
          <>
            <input
              type="number" min="0" value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white"
              placeholder="Set price"
              autoFocus
            />
            <button onClick={savePrice} disabled={savingPrice}
              className="px-2.5 py-1 text-xs font-semibold text-white rounded-lg disabled:opacity-60"
              style={{ background: 'var(--color-primary)' }}>
              {savingPrice ? '…' : 'Save'}
            </button>
            <button onClick={() => { setEditingPrice(false); setPriceInput(task.finalPrice ?? ''); }}
              className="px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200">
              Cancel
            </button>
          </>
        ) : (
          <>
            <span className="text-sm font-semibold text-gray-900">
              {task.finalPrice ? `₹${task.finalPrice.toLocaleString('en-IN')}` : <span className="text-gray-400 font-normal italic">Not set</span>}
            </span>
            <button onClick={() => { setEditingPrice(true); setPriceInput(task.finalPrice ?? ''); }}
              className="ml-1 text-violet-500 hover:text-violet-700 transition-colors">
              <Pencil className="w-3 h-3" />
            </button>
          </>
        )}
      </div>

      {/* Totals row */}
      {task.finalPrice && (
        <div className="flex items-center gap-4 text-xs">
          <span className="text-gray-500">
            Paid: <span className="font-semibold text-green-700">₹{(task.totalPaid || 0).toLocaleString('en-IN')}</span>
          </span>
          <span className="text-gray-500">
            Pending: <span className={`font-semibold ${task.amountPending > 0 ? 'text-red-600' : 'text-green-600'}`}>
              ₹{(task.amountPending || 0).toLocaleString('en-IN')}
            </span>
          </span>
        </div>
      )}

      {/* Payment entries */}
      {entries.length > 0 && (
        <div className="space-y-1.5">
          {entries.map((entry) => (
            <div key={entry._id}>
              {editingEntry === entry._id ? (
                <EntryForm
                  initial={entry}
                  onSave={(data) => handleEditEntry(entry._id, data)}
                  onCancel={() => setEditingEntry(null)}
                  saving={savingEntry}
                />
              ) : (
                <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-100">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-800">₹{entry.amount.toLocaleString('en-IN')}</span>
                      <span className="text-xs text-gray-400">{fmtDate(entry.date)}</span>
                    </div>
                    {entry.note && <p className="text-xs text-gray-500 truncate mt-0.5">{entry.note}</p>}
                  </div>
                  <button onClick={() => setEditingEntry(entry._id)}
                    className="text-gray-400 hover:text-violet-600 transition-colors flex-shrink-0">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteEntry(entry._id)}
                    disabled={deletingEntry === entry._id}
                    className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 disabled:opacity-40">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add entry */}
      {addingEntry ? (
        <EntryForm
          onSave={handleAddEntry}
          onCancel={() => setAddingEntry(false)}
          saving={savingEntry}
        />
      ) : (
        <button
          onClick={() => {
            if (!task.finalPrice) { toast.error('Set final price first'); return; }
            setAddingEntry(true);
          }}
          className="flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-800 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add payment entry
        </button>
      )}
    </div>
  );
}