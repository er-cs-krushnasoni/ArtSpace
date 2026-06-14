// frontend/src/pages/admin/FAQManagerPage.jsx
import { useState, useEffect } from 'react';
import {
  HelpCircle, Plus, Trash2, GripVertical,
  ChevronDown, ChevronUp, Eye, EyeOff, Save, X,
} from 'lucide-react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = ({ onAdd }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
      <HelpCircle className="w-7 h-7 text-violet-400" />
    </div>
    <p className="text-base font-semibold text-gray-800 mb-1">No FAQs yet</p>
    <p className="text-sm text-gray-400 mb-6 max-w-xs">
      Add common questions your customers ask — helps reduce repeat queries.
    </p>
    <button
      onClick={onAdd}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors"
    >
      <Plus className="w-4 h-4" />
      Add First FAQ
    </button>
  </div>
);

// ─── FAQ Form (inline add / edit) ─────────────────────────────────────────────
const FAQForm = ({ initial = {}, onSave, onCancel, saving }) => {
  const [question, setQuestion] = useState(initial.question || '');
  const [answer,   setAnswer]   = useState(initial.answer   || '');

  const handleSubmit = () => {
    if (!question.trim()) { toast.error('Question is required'); return; }
    if (!answer.trim())   { toast.error('Answer is required');   return; }
    onSave({ question: question.trim(), answer: answer.trim() });
  };

  return (
    <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 space-y-3">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Question</label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. How long does delivery take?"
          maxLength={300}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 bg-white"
        />
        <p className="text-[10px] text-gray-400 mt-1 text-right">{question.length}/300</p>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Answer</label>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type the answer here…"
          rows={3}
          maxLength={2000}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 bg-white resize-none"
        />
        <p className="text-[10px] text-gray-400 mt-1 text-right">{answer.length}/2000</p>
      </div>
      <div className="flex items-center gap-2 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors disabled:opacity-60"
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? 'Saving…' : 'Save FAQ'}
        </button>
      </div>
    </div>
  );
};

// ─── FAQ Row ──────────────────────────────────────────────────────────────────
const FAQRow = ({
  faq, index, total,
  onMoveUp, onMoveDown,
  onToggleActive, onEdit, onDelete,
  togglingId, deletingId,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`bg-white border rounded-xl transition-all duration-200 ${
        faq.isActive ? 'border-gray-100' : 'border-dashed border-gray-200 opacity-60'
      }`}
    >
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Drag handle / order buttons */}
        <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
          <button
            onClick={() => onMoveUp(index)}
            disabled={index === 0}
            className="p-0.5 rounded text-gray-300 hover:text-gray-500 disabled:opacity-0 transition-colors"
            aria-label="Move up"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <GripVertical className="w-4 h-4 text-gray-300" />
          <button
            onClick={() => onMoveDown(index)}
            disabled={index === total - 1}
            className="p-0.5 rounded text-gray-300 hover:text-gray-500 disabled:opacity-0 transition-colors"
            aria-label="Move down"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Question text — click to expand */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex-1 text-left min-w-0"
        >
          <p className="text-sm font-medium text-gray-800 truncate">{faq.question}</p>
          {!expanded && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">{faq.answer}</p>
          )}
        </button>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Visibility toggle */}
          <button
            onClick={() => onToggleActive(faq)}
            disabled={togglingId === faq._id}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 disabled:opacity-50"
            title={faq.isActive ? 'Hide this FAQ' : 'Show this FAQ'}
          >
            {faq.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          {/* Edit */}
          <button
            onClick={() => onEdit(faq)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-violet-600"
            title="Edit FAQ"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
            </svg>
          </button>
          {/* Delete */}
          <button
            onClick={() => onDelete(faq)}
            disabled={deletingId === faq._id}
            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-gray-400 hover:text-red-500 disabled:opacity-50"
            title="Delete FAQ"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {/* Expand toggle */}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded answer */}
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-gray-50">
          <p className="text-sm text-gray-600 leading-relaxed mt-3 whitespace-pre-wrap">
            {faq.answer}
          </p>
        </div>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FAQManagerPage() {
  const [faqs,       setFaqs]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [faqEnabled, setFaqEnabled] = useState(false);
  const [toggling,   setToggling]   = useState(false);   // for the global enable/disable
  const [showForm,   setShowForm]   = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);    // FAQ object being edited
  const [saving,     setSaving]     = useState(false);
  const [togglingId, setTogglingId] = useState(null);    // per-row visibility toggle
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [faqRes, settingsRes] = await Promise.all([
        api.get('/tenant/faq'),
        api.get('/tenant/settings'),
      ]);
      setFaqs(faqRes.data.data || []);
      setFaqEnabled(settingsRes.data.data?.websiteConfig?.faqEnabled ?? false);
    } catch {
      toast.error('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  // ── Global FAQ section enable/disable ──────────────────────────────────────
  const handleGlobalToggle = async (val) => {
    setToggling(true);
    const prev = faqEnabled;
    setFaqEnabled(val);
    try {
      await api.put('/tenant/settings/toggles', { faqEnabled: val });
      toast.success(val ? 'FAQ section enabled' : 'FAQ section disabled');
    } catch {
      setFaqEnabled(prev);
      toast.error('Failed to update FAQ visibility');
    } finally {
      setToggling(false);
    }
  };

  // ── Create ─────────────────────────────────────────────────────────────────
  const handleCreate = async ({ question, answer }) => {
    setSaving(true);
    try {
      const res = await api.post('/tenant/faq', { question, answer });
      setFaqs((prev) => [...prev, res.data.data]);
      setShowForm(false);
      toast.success('FAQ added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create FAQ');
    } finally {
      setSaving(false);
    }
  };

  // ── Update ─────────────────────────────────────────────────────────────────
  const handleUpdate = async ({ question, answer }) => {
    if (!editingFaq) return;
    setSaving(true);
    try {
      const res = await api.put(`/tenant/faq/${editingFaq._id}`, { question, answer });
      setFaqs((prev) => prev.map((f) => (f._id === editingFaq._id ? res.data.data : f)));
      setEditingFaq(null);
      toast.success('FAQ updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update FAQ');
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle row visibility ──────────────────────────────────────────────────
  const handleToggleActive = async (faq) => {
    setTogglingId(faq._id);
    const newVal = !faq.isActive;
    // optimistic
    setFaqs((prev) => prev.map((f) => (f._id === faq._id ? { ...f, isActive: newVal } : f)));
    try {
      await api.put(`/tenant/faq/${faq._id}`, { isActive: newVal });
    } catch {
      setFaqs((prev) => prev.map((f) => (f._id === faq._id ? { ...f, isActive: !newVal } : f)));
      toast.error('Failed to update FAQ visibility');
    } finally {
      setTogglingId(null);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (faq) => {
    if (!window.confirm(`Delete "${faq.question}"?`)) return;
    setDeletingId(faq._id);
    try {
      await api.delete(`/tenant/faq/${faq._id}`);
      setFaqs((prev) => prev.filter((f) => f._id !== faq._id));
      toast.success('FAQ deleted');
    } catch {
      toast.error('Failed to delete FAQ');
    } finally {
      setDeletingId(null);
    }
  };

  // ── Reorder via up/down buttons ────────────────────────────────────────────
  const moveItem = async (index, direction) => {
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= faqs.length) return;

    const reordered = [...faqs];
    [reordered[index], reordered[swapIndex]] = [reordered[swapIndex], reordered[index]];
    setFaqs(reordered);

    try {
      await api.put('/tenant/faq/reorder', { orderedIds: reordered.map((f) => f._id) });
    } catch {
      toast.error('Failed to save order');
      setFaqs(faqs); // rollback
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">FAQ Manager</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage frequently asked questions shown on your public shop
          </p>
        </div>
        <div className="hidden sm:flex items-center justify-center w-10 h-10 bg-violet-50 rounded-xl">
          <HelpCircle className="w-5 h-5 text-violet-600" />
        </div>
      </div>

      {/* Global enable/disable card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-800">FAQ Section</p>
            <p className="text-xs text-gray-400 mt-0.5">
              When enabled, a FAQ accordion appears on your home page and at{' '}
              <span className="font-medium text-gray-500">/faq</span>
            </p>
          </div>
          <button
            role="switch"
            aria-checked={faqEnabled}
            onClick={() => !toggling && handleGlobalToggle(!faqEnabled)}
            disabled={toggling}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/30 disabled:opacity-50 ${
              faqEnabled ? 'bg-violet-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                faqEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* FAQ list card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">
              Questions{' '}
              <span className="text-gray-400 font-normal">({faqs.length}/20)</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Use the eye icon to show/hide individual questions
            </p>
          </div>
          {faqs.length > 0 && !showForm && !editingFaq && (
            <button
              onClick={() => setShowForm(true)}
              disabled={faqs.length >= 20}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5" />
              Add FAQ
            </button>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : faqs.length === 0 && !showForm ? (
          <EmptyState onAdd={() => setShowForm(true)} />
        ) : (
          <div className="space-y-3">
            {/* Add form at top */}
            {showForm && (
              <FAQForm
                onSave={handleCreate}
                onCancel={() => setShowForm(false)}
                saving={saving}
              />
            )}

            {/* FAQ rows */}
            {faqs.map((faq, index) =>
              editingFaq?._id === faq._id ? (
                <FAQForm
                  key={faq._id}
                  initial={faq}
                  onSave={handleUpdate}
                  onCancel={() => setEditingFaq(null)}
                  saving={saving}
                />
              ) : (
                <FAQRow
                  key={faq._id}
                  faq={faq}
                  index={index}
                  total={faqs.length}
                  onMoveUp={(i)  => moveItem(i, 'up')}
                  onMoveDown={(i) => moveItem(i, 'down')}
                  onToggleActive={handleToggleActive}
                  onEdit={(f) => { setEditingFaq(f); setShowForm(false); }}
                  onDelete={handleDelete}
                  togglingId={togglingId}
                  deletingId={deletingId}
                />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}