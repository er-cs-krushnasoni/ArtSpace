import { useState, useEffect, useCallback, useRef } from 'react';
import {
  HelpCircle, Plus, Trash2, ChevronUp, ChevronDown,
  Save, ToggleLeft, ToggleRight, Wand2, X, Tag, ChevronDown as ChevronDownSm,
} from 'lucide-react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { useTenant } from '../../context/TenantContext';
import { getLabels } from '../../config/businessTypeLabels';
import { QUIZ_TEMPLATES } from '../../config/quizTemplates';

// ── Business type → template key mapping ─────────────────────────────────────
const BUSINESS_TYPE_TO_TEMPLATE = {
  nail_art:                'nail_art',
  mehendi:                 'mehendi',
  handmade_jewellery:      'jewellery',
  artificial_jewellery:    'jewellery',
  beaded_jewellery:        'jewellery',
  silver_jewellery:        'jewellery',
  bridal_jewellery_rental: 'jewellery',
  cake:                    'cake',
  home_baker:              'cake',
  dessert_business:        'cake',
  donut_shop:              'cake',
  macaron_business:        'cake',
  makeup_artist:           'makeup_artist',
  bridal_stylist:          'makeup_artist',
  eyelash_artist:          'makeup_artist',
  hair_stylist:            'makeup_artist',
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="space-y-4">
    {[1, 2].map((i) => (
      <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 animate-pulse">
        <div className="h-4 bg-gray-100 rounded w-2/3 mb-4" />
        <div className="space-y-2">
          <div className="h-3 bg-gray-100 rounded w-1/2" />
          <div className="h-3 bg-gray-100 rounded w-1/3" />
        </div>
      </div>
    ))}
  </div>
);

// ── Template picker modal ─────────────────────────────────────────────────────
const TemplatePickerModal = ({ templates, onSelect, onClose }) => {
  const [query, setQuery] = useState('');
  const filtered = templates.filter(key =>
    key.replace(/_/g, ' ').toLowerCase().includes(query.toLowerCase())
  );
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <p className="text-sm font-semibold text-gray-900">Choose a template</p>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-4 pb-3">
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search templates…"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>
        <ul className="max-h-64 overflow-y-auto pb-2">
          {filtered.length === 0 ? (
            <>
              <li className="px-5 py-3 text-sm text-gray-400 text-center">No templates found</li>
              <li>
                <button
                  onClick={() => onSelect('other')}
                  className="w-full text-left px-5 py-2.5 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors flex items-center gap-2"
                >
                  <span className="text-violet-400">✦</span> Other
                </button>
              </li>
            </>
          ) : (
            filtered.map(key => (
              <li key={key}>
                <button
                  onClick={() => onSelect(key)}
                  className="w-full text-left px-5 py-2.5 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                >
                  {key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

// ── Category picker dropdown (per option) ─────────────────────────────────────
// categories: [{ _id, groupName, values }]
// selected:   [categoryId, ...]
const CategoryPicker = ({ categories, selected, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const toggle = (id) => {
    const strId = String(id);
    const already = selected.map(String).includes(strId);
    onChange(already ? selected.filter(s => String(s) !== strId) : [...selected, id]);
  };

  const selectedNames = categories
    .filter(c => selected.map(String).includes(String(c._id)))
    .map(c => c.groupName);

  if (categories.length === 0) return null;

  return (
    <div className="relative mt-1.5" ref={ref}>
      {/* Selected pills */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1.5">
          {selectedNames.map((name, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-violet-50 text-violet-700 border border-violet-100"
            >
              {name}
              <button
                type="button"
                onClick={() => {
                  const cat = categories.find(c => c.groupName === name);
                  if (cat) toggle(cat._id);
                }}
                className="text-violet-400 hover:text-violet-700 transition-colors"
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-600 transition-colors"
      >
        <Tag size={11} />
        {selected.length === 0 ? 'Link to categories (optional)' : 'Edit categories'}
        <ChevronDownSm size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-full mt-1 z-30 bg-white border border-gray-200 rounded-xl shadow-lg w-64 py-1.5 max-h-52 overflow-y-auto">
          <p className="px-3 pb-1.5 pt-0.5 text-xs text-gray-400 font-medium border-b border-gray-100 mb-1">
            Select which categories match this answer
          </p>
          {categories.map((cat) => {
            const isSelected = selected.map(String).includes(String(cat._id));
            return (
              <button
                key={cat._id}
                type="button"
                onClick={() => toggle(cat._id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors text-left ${
                  isSelected
                    ? 'bg-violet-50 text-violet-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div>
                  <span className="font-medium">{cat.groupName}</span>
                  {cat.values?.length > 0 && (
                    <span className="ml-1.5 text-gray-400">
                      {cat.values.slice(0, 3).join(', ')}
                      {cat.values.length > 3 ? '…' : ''}
                    </span>
                  )}
                </div>
                {isSelected && (
                  <span className="w-3.5 h-3.5 rounded-full bg-violet-500 flex items-center justify-center flex-shrink-0">
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1.5 4L3 5.5L6.5 2.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Option row ────────────────────────────────────────────────────────────────
const OptionRow = ({ opt, onChange, onRemove, canRemove, categories }) => (
  <div className="rounded-lg border border-gray-200 px-3 py-2.5 bg-gray-50/50">
    <div className="flex items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
      <input
        type="text"
        value={opt.text}
        onChange={(e) => onChange({ ...opt, text: e.target.value })}
        placeholder="Answer option…"
        maxLength={120}
        className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-violet-400 transition-colors bg-white"
      />
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
        >
          <X size={14} />
        </button>
      )}
    </div>

    {/* Category linker — shown when tenant has categories */}
    {categories.length > 0 && (
      <div className="ml-5 mt-1.5">
        <CategoryPicker
          categories={categories}
          selected={opt.categoryIds || []}
          onChange={(newIds) => onChange({ ...opt, categoryIds: newIds })}
        />
      </div>
    )}
  </div>
);

// ── Question card ─────────────────────────────────────────────────────────────
const QuestionCard = ({ q, idx, total, onChange, onRemove, onMove, categories }) => {
  const addOption = () => {
    if (q.options.length >= 4) return;
    onChange({ ...q, options: [...q.options, { text: '', categoryIds: [] }] });
  };
  const updateOption = (oi, updated) => {
    const opts = q.options.map((o, i) => (i === oi ? updated : o));
    onChange({ ...q, options: opts });
  };
  const removeOption = (oi) => {
    onChange({ ...q, options: q.options.filter((_, i) => i !== oi) });
  };

  return (
    <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-5">
      {/* Question header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="flex flex-col gap-0.5 pt-1">
          <button
            onClick={() => onMove(idx, 'up')}
            disabled={idx === 0}
            className="p-1 rounded text-gray-300 hover:text-gray-600 disabled:opacity-30 transition-colors"
          >
            <ChevronUp size={14} />
          </button>
          <button
            onClick={() => onMove(idx, 'down')}
            disabled={idx === total - 1}
            className="p-1 rounded text-gray-300 hover:text-gray-600 disabled:opacity-30 transition-colors"
          >
            <ChevronDown size={14} />
          </button>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
              Q{idx + 1}
            </span>
            <button
              onClick={onRemove}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
          <input
            type="text"
            value={q.questionText}
            onChange={(e) => onChange({ ...q, questionText: e.target.value })}
            placeholder="Type your question…"
            maxLength={200}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-medium focus:outline-none focus:border-violet-400 transition-colors"
          />
        </div>
      </div>

      {/* Options */}
      <div className="ml-8 space-y-2">
        {q.options.map((opt, oi) => (
          <OptionRow
            key={oi}
            opt={opt}
            onChange={(updated) => updateOption(oi, updated)}
            onRemove={() => removeOption(oi)}
            canRemove={q.options.length > 2}
            categories={categories}
          />
        ))}
        {q.options.length < 4 && (
          <button
            type="button"
            onClick={addOption}
            className="flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-800 font-medium mt-1 transition-colors"
          >
            <Plus size={12} /> Add option
          </button>
        )}
        <p className="text-xs text-gray-400">{q.options.length}/4 options</p>
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
export default function QuizBuilderPage() {
  const { tenant } = useTenant();
  const businessType = tenant?.businessType || 'generic';
  const labels = getLabels(businessType);
  const quizName = labels.quiz_name || 'Style Quiz';
  const isOtherType = businessType === 'other' || businessType === 'generic';

  const [questions, setQuestions]         = useState([]);
  const [enabled, setEnabled]             = useState(false);
  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(false);
  const [toggling, setToggling]           = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [categories, setCategories]       = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const [quizRes, settingsRes, catRes] = await Promise.all([
        api.get('/tenant/quiz'),
        api.get('/tenant/settings'),
        api.get('/tenant/categories'),
      ]);
      setQuestions(quizRes.data.data || []);
      setEnabled(settingsRes.data.data?.websiteConfig?.quizEnabled ?? false);
      setCategories(catRes.data.data || []);
    } catch {
      toast.error('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const makeBlankQuestion = () => ({
    questionText: '',
    options: [
      { text: '', categoryIds: [] },
      { text: '', categoryIds: [] },
    ],
  });

  const addQuestion = () => {
    if (questions.length >= 5) return;
    setQuestions((prev) => [...prev, makeBlankQuestion()]);
  };

  const updateQuestion = (idx, updated) => {
    setQuestions((prev) => prev.map((q, i) => (i === idx ? updated : q)));
  };

  const removeQuestion = (idx) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const moveQuestion = (idx, dir) => {
    const arr = [...questions];
    const to = dir === 'up' ? idx - 1 : idx + 1;
    if (to < 0 || to >= arr.length) return;
    [arr[idx], arr[to]] = [arr[to], arr[idx]];
    setQuestions(arr);
  };

  const loadTemplate = (templateKey) => {
    const tpl = QUIZ_TEMPLATES[templateKey] || QUIZ_TEMPLATES.generic;
    setQuestions(tpl.map((q) => ({ ...q })));
    setShowTemplatePicker(false);
    toast.success('Template loaded — customise and save');
  };

  const handleLoadTemplate = () => {
    if (isOtherType) {
      setShowTemplatePicker(true);
    } else {
      const key = BUSINESS_TYPE_TO_TEMPLATE[businessType] || 'generic';
      loadTemplate(key);
    }
  };

  const handleSave = async () => {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        toast.error(`Question ${i + 1} needs text`);
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].text.trim()) {
          toast.error(`Q${i + 1}, option ${j + 1} needs text`);
          return;
        }
      }
    }
    if (questions.length > 0 && questions.length < 3) {
      toast.error('Add at least 3 questions (or clear all)');
      return;
    }
    setSaving(true);
    try {
      await api.put('/tenant/quiz', { questions });
      toast.success('Quiz saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async () => {
    setToggling(true);
    try {
      const newVal = !enabled;
      await api.put('/tenant/settings/toggles', { quizEnabled: newVal });
      setEnabled(newVal);
      toast.success(newVal ? 'Quiz enabled on your shop' : 'Quiz hidden from your shop');
    } catch {
      toast.error('Failed to update setting');
    } finally {
      setToggling(false);
    }
  };

  // Count how many options across all questions have at least one category linked
  const linkedCount = questions.reduce((acc, q) =>
    acc + q.options.filter(o => o.categoryIds?.length > 0).length, 0
  );
  const totalOptions = questions.reduce((acc, q) => acc + q.options.length, 0);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{quizName} Builder</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Create questions to help customers discover the right products
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60 transition-opacity hover:opacity-90"
          style={{ background: 'var(--color-primary)' }}
        >
          <Save size={15} />
          {saving ? 'Saving…' : 'Save Quiz'}
        </button>
      </div>

      {/* Enable toggle card */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-4 mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">Show quiz on your shop</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Customers can find it in your shop navigation
          </p>
        </div>
        <button
          onClick={handleToggle}
          disabled={toggling}
          className="flex items-center gap-1.5 text-sm font-medium transition-colors disabled:opacity-60"
          style={{ color: enabled ? 'var(--color-primary)' : '#9ca3af' }}
        >
          {enabled
            ? <ToggleRight size={28} style={{ color: 'var(--color-primary)' }} />
            : <ToggleLeft size={28} className="text-gray-300" />}
          {enabled ? 'Enabled' : 'Disabled'}
        </button>
      </div>

      {/* Info banner — adapts based on whether categories exist */}
      {!loading && (
        <div className={`border rounded-xl p-4 mb-5 flex gap-3 ${
          categories.length === 0
            ? 'bg-amber-50 border-amber-100'
            : linkedCount > 0
              ? 'bg-green-50 border-green-100'
              : 'bg-blue-50 border-blue-100'
        }`}>
          <div className="flex-shrink-0 mt-0.5">
            <HelpCircle size={16} className={
              categories.length === 0 ? 'text-amber-400'
              : linkedCount > 0 ? 'text-green-400'
              : 'text-blue-400'
            } />
          </div>
          <div>
            {categories.length === 0 ? (
              <>
                <p className="text-xs font-semibold text-amber-800 mb-1">No categories set up yet</p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Matching works via answer text — but works best when your products have categories like "Bold", "Minimal", "Wedding".
                  Set up categories first for more accurate recommendations.
                </p>
              </>
            ) : linkedCount > 0 ? (
              <>
                <p className="text-xs font-semibold text-green-800 mb-1">
                  Category linking active — {linkedCount}/{totalOptions} options linked
                </p>
                <p className="text-xs text-green-700 leading-relaxed">
                  Linked options get stronger matching (+2× per vote). Unlinked options still match via answer text.
                </p>
              </>
            ) : (
              <>
                <p className="text-xs font-semibold text-blue-800 mb-1">How product matching works</p>
                <p className="text-xs text-blue-600 leading-relaxed">
                  Matching uses answer text against your category values automatically.
                  For stronger results, link each answer to a category using <strong>Link to categories</strong> under each option.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <Skeleton />
      ) : (
        <>
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-gray-500">
              {questions.length}/5 questions · minimum 3 to publish
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleLoadTemplate}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Wand2 size={13} />
                {isOtherType ? 'Load Template' : 'Load Default Template'}
              </button>
              <button
                onClick={addQuestion}
                disabled={questions.length >= 5}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-40 transition-opacity hover:opacity-90"
                style={{ background: 'var(--color-primary)' }}
              >
                <Plus size={13} /> Add Question
              </button>
            </div>
          </div>

          {/* Questions */}
          {questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <HelpCircle className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-500">No questions yet</p>
              <p className="text-xs text-gray-400 mt-1">
                {isOtherType
                  ? 'Load a template or add questions manually'
                  : 'Load the default template or add questions manually'}
              </p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleLoadTemplate}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Wand2 size={13} />
                  {isOtherType ? 'Load Template' : 'Load Default Template'}
                </button>
                <button
                  onClick={addQuestion}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white hover:opacity-90"
                  style={{ background: 'var(--color-primary)' }}
                >
                  <Plus size={13} /> Add Question
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <QuestionCard
                  key={idx}
                  q={q}
                  idx={idx}
                  total={questions.length}
                  onChange={(updated) => updateQuestion(idx, updated)}
                  onRemove={() => removeQuestion(idx)}
                  onMove={moveQuestion}
                  categories={categories}
                />
              ))}
              {questions.length < 5 && (
                <button
                  onClick={addQuestion}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:border-violet-300 hover:text-violet-500 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={15} /> Add another question
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Template picker modal */}
      {showTemplatePicker && (
        <TemplatePickerModal
          templates={Object.keys(QUIZ_TEMPLATES)}
          onSelect={loadTemplate}
          onClose={() => setShowTemplatePicker(false)}
        />
      )}
    </div>
  );
}