import { useState } from 'react';
import { Edit2, Trash2, Tag, Plus, X, Check, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../api/axiosInstance';

// ─── Tag Input ────────────────────────────────────────────────────────────────
function TagInput({ values, onChange }) {
  const [inputVal, setInputVal] = useState('');

  const addValue = () => {
    const trimmed = inputVal.trim();
    if (!trimmed) return;
    if (values.includes(trimmed)) {
      toast.error('Value already exists');
      return;
    }
    onChange([...values, trimmed]);
    setInputVal('');
  };

  const removeValue = (val) => onChange(values.filter((v) => v !== val));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addValue();
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-2 min-h-[44px] flex flex-wrap gap-1.5 focus-within:ring-2 focus-within:ring-violet-500/30 focus-within:border-violet-400 transition-all">
      {values.map((val) => (
        <span
          key={val}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-violet-50 text-violet-700"
        >
          {val}
          <button
            type="button"
            onClick={() => removeValue(val)}
            className="text-violet-400 hover:text-violet-700 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addValue}
        placeholder={values.length === 0 ? 'Type a value, press Enter to add…' : 'Add more…'}
        className="flex-1 min-w-[120px] text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400"
      />
    </div>
  );
}

// ─── Category Form (inline create / edit) ─────────────────────────────────────
function CategoryForm({ initial, onSave, onCancel, saving }) {
  const [groupName, setGroupName] = useState(initial?.groupName || '');
  const [values, setValues] = useState(initial?.values || []);

  const handleSubmit = () => {
    if (!groupName.trim()) {
      toast.error('Group name is required');
      return;
    }
    onSave({ groupName: groupName.trim(), values });
  };

  return (
    <div className="bg-violet-50/50 border border-violet-100 rounded-xl p-4 space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">
          Group Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="e.g. Colour, Style, Occasion"
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 bg-white"
          autoFocus
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">Values</label>
        <TagInput values={values} onChange={setValues} />
        <p className="text-xs text-gray-400 mt-1">Press Enter or comma to add each value</p>
      </div>
      <div className="flex gap-2 justify-end pt-1">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-3 py-1.5 text-sm font-medium text-white rounded-lg transition-all disabled:opacity-60"
          style={{ background: 'var(--color-primary, #8b5cf6)' }}
        >
          {saving ? 'Saving…' : initial?._id ? 'Update' : 'Save'}
        </button>
      </div>
    </div>
  );
}

// ─── Delete Confirm (inline) ──────────────────────────────────────────────────
function DeleteConfirm({ category, onConfirm, onCancel, deleting }) {
  return (
    <div className="mt-2 flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg p-3">
      <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1 text-sm text-red-700">
        Delete <strong>{category.groupName}</strong>? This will remove it from all products.
      </div>
      <div className="flex gap-1.5 flex-shrink-0">
        <button
          onClick={onCancel}
          className="px-2.5 py-1 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-white transition-all"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={deleting}
          className="px-2.5 py-1 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all disabled:opacity-60"
        >
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </div>
  );
}

// ─── Category Card ────────────────────────────────────────────────────────────
function CategoryCard({ category, onUpdated, onDeleted }) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleUpdate = async ({ groupName, values }) => {
    setSaving(true);
    try {
      const res = await api.put(`/tenant/categories/${category._id}`, { groupName, values });
      onUpdated(res.data.data);
      setEditing(false);
      toast.success('Category updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/tenant/categories/${category._id}`);
      onDeleted(category._id);
      toast.success('Category deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    } finally {
      setDeleting(false);
    }
  };

  if (editing) {
    return (
      <CategoryForm
        initial={category}
        onSave={handleUpdate}
        onCancel={() => setEditing(false)}
        saving={saving}
      />
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">{category.groupName}</h3>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {category.values.length === 0 ? (
              <span className="text-xs text-gray-400 italic">No values yet</span>
            ) : (
              category.values.map((val) => (
                <span
                  key={val}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
                >
                  {val}
                </span>
              ))
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => { setEditing(true); setConfirmDelete(false); }}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-all"
            title="Edit"
          >
            <Edit2 className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={() => { setConfirmDelete((v) => !v); setEditing(false); }}
            className="p-1.5 rounded-lg hover:bg-red-50 transition-all"
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>
      {confirmDelete && (
        <DeleteConfirm
          category={category}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
          deleting={deleting}
        />
      )}
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function CategoryManager({ categories, setCategories, loading }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleCreate = async ({ groupName, values }) => {
    setSaving(true);
    try {
      const res = await api.post('/tenant/categories', { groupName, values });
      setCategories((prev) => [...prev, res.data.data]);
      setShowAddForm(false);
      toast.success('Category created');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create category');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdated = (updated) =>
    setCategories((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));

  const handleDeleted = (id) =>
    setCategories((prev) => prev.filter((c) => c._id !== id));

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {categories.length === 0 && !showAddForm && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Tag className="w-10 h-10 text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-500">No categories yet</p>
          <p className="text-xs text-gray-400 mt-1">Create groups like "Colour" or "Style" to organise your products</p>
        </div>
      )}

      {categories.map((cat) => (
        <CategoryCard
          key={cat._id}
          category={cat}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      ))}

      {showAddForm ? (
        <CategoryForm
          onSave={handleCreate}
          onCancel={() => setShowAddForm(false)}
          saving={saving}
        />
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-medium text-gray-500 hover:border-violet-300 hover:text-violet-600 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Category Group
        </button>
      )}
    </div>
  );
}