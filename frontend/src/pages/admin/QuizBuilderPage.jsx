import { useState, useEffect, useCallback, useRef } from 'react';
import {
  HelpCircle, Plus, Trash2, ChevronUp, ChevronDown,
  Save, ToggleLeft, ToggleRight, Wand2, X, Tag, ChevronDown as ChevronDownSm,
  AlertTriangle,
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
  // selected: [{ categoryId, values: [] }]
  const [open, setOpen] = useState(false);
  const [expandedCat, setExpandedCat] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Helpers
  const getLink = (catId) =>
    selected.find((s) => String(s.categoryId) === String(catId));

  const isGroupLinked = (catId) => !!getLink(catId);

  const isValueLinked = (catId, val) => {
    const link = getLink(catId);
    return link ? link.values.includes(val) : false;
  };

  const toggleGroup = (cat) => {
    const linked = isGroupLinked(cat._id);
    if (linked) {
      // remove entire group
      onChange(selected.filter((s) => String(s.categoryId) !== String(cat._id)));
    } else {
      // add group with all values pre-selected
      onChange([...selected, { categoryId: cat._id, values: [...(cat.values || [])] }]);
      setExpandedCat(String(cat._id));
    }
  };

  const toggleValue = (cat, val) => {
    const link = getLink(cat._id);
    if (!link) {
      // add group with just this value
      onChange([...selected, { categoryId: cat._id, values: [val] }]);
    } else {
      const newValues = link.values.includes(val)
        ? link.values.filter((v) => v !== val)
        : [...link.values, val];
      if (newValues.length === 0) {
        // remove group entirely if no values left
        onChange(selected.filter((s) => String(s.categoryId) !== String(cat._id)));
      } else {
        onChange(selected.map((s) =>
          String(s.categoryId) === String(cat._id) ? { ...s, values: newValues } : s
        ));
      }
    }
  };

  // Build pill labels
  const pills = selected.flatMap((link) => {
    const cat = categories.find((c) => String(c._id) === String(link.categoryId));
    if (!cat) return [{ label: '⚠ Deleted category', catId: link.categoryId, value: null, broken: true }];
    if (link.values.length === 0 || link.values.length === (cat.values || []).length) {
      return [{ label: cat.groupName, catId: cat._id, value: null }];
    }
    return link.values.map((v) => ({ label: `${cat.groupName}: ${v}`, catId: cat._id, value: v }));
  });

  const removePill = (catId, value) => {
    if (value === null) {
      onChange(selected.filter((s) => String(s.categoryId) !== String(catId)));
    } else {
      toggleValue(categories.find((c) => String(c._id) === String(catId)), value);
    }
  };

  if (categories.length === 0) return null;

  return (
    <div className="relative mt-1.5" ref={ref}>
      {/* Pills */}
      {pills.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1.5">
          {pills.map((pill, i) => (
            <span
              key={i}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
              pill.broken
                ? 'bg-red-50 text-red-600 border-red-200'
                : 'bg-violet-50 text-violet-700 border-violet-100'
            }`}
            >
              {pill.label}
              <button
                type="button"
                onClick={() => removePill(pill.catId, pill.value)}
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
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-600 transition-colors"
      >
        <Tag size={11} />
        {selected.length === 0 ? 'Link to categories (optional)' : 'Edit categories'}
        <ChevronDownSm size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-full mt-1 z-30 bg-white border border-gray-200 rounded-xl shadow-lg w-72 max-w-[calc(100vw-2rem)] py-1.5 max-h-64 overflow-y-auto">
          <p className="px-3 pb-1.5 pt-0.5 text-xs text-gray-400 font-medium border-b border-gray-100 mb-1">
            Select categories &amp; subcategories
          </p>
          {categories.map((cat) => {
            const linked = isGroupLinked(cat._id);
            const isExp = expandedCat === String(cat._id);
            const hasValues = cat.values?.length > 0;
            return (
              <div key={cat._id}>
                {/* Group row */}
                <div className={`flex items-center justify-between px-3 py-2 transition-colors ${linked ? 'bg-violet-50' : 'hover:bg-gray-50'}`}>
                  <button
                    type="button"
                    onClick={() => toggleGroup(cat)}
                    className={`flex-1 text-xs font-semibold text-left transition-colors ${linked ? 'text-violet-700' : 'text-gray-700'}`}
                  >
                    {cat.groupName}
                    {linked && (
                      <span className="ml-1.5 font-normal text-violet-500">
                        ({getLink(cat._id)?.values.length || 0}/{(cat.values || []).length})
                      </span>
                    )}
                  </button>
                  <div className="flex items-center gap-1.5">
                    {linked && (
                      <span className="w-3.5 h-3.5 rounded-full bg-violet-500 flex items-center justify-center flex-shrink-0">
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <path d="M1.5 4L3 5.5L6.5 2.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    )}
                    {hasValues && (
                      <button
                        type="button"
                        onClick={() => setExpandedCat(isExp ? null : String(cat._id))}
                        className="p-0.5 text-gray-400 hover:text-violet-600 transition-colors"
                      >
                        <ChevronDownSm size={11} className={`transition-transform ${isExp ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                  </div>
                </div>
                {/* Values */}
                {hasValues && isExp && (
                  <div className="bg-gray-50 border-t border-b border-gray-100 py-1 px-2">
                    <div className="flex flex-wrap gap-1 py-1">
                      {cat.values.map((val) => {
                        const active = isValueLinked(cat._id, val);
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => toggleValue(cat, val)}
                            className={`px-2 py-0.5 rounded-full text-xs font-medium border transition-colors ${
                              active
                                ? 'bg-violet-500 text-white border-violet-500'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300 hover:text-violet-600'
                            }`}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
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
        className="flex-1 min-w-0 px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-violet-400 transition-colors bg-white"
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
    {categories.length > 0 && (
      <div className="ml-5 mt-1.5">
        <CategoryPicker
          categories={categories}
          selected={opt.categoryLinks || []}
          onChange={(newLinks) => onChange({ ...opt, categoryLinks: newLinks })}
        />
      </div>
    )}
  </div>
);

// ── Question card ─────────────────────────────────────────────────────────────
const QuestionCard = ({ q, idx, total, onChange, onRemove, onMove, categories }) => {
  const addOption = () => {
    if (q.options.length >= 4) return;
    onChange({ ...q, options: [...q.options, { text: '', categoryLinks: [] }] });
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
      setQuestions((quizRes.data.data || []).map((q) => ({
  ...q,
  options: q.options.map((opt) => ({
    ...opt,
    categoryLinks: opt.categoryLinks || [],
  })),
})));
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
    { text: '', categoryLinks: [] },
    { text: '', categoryLinks: [] },
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
  setQuestions(tpl.map((q) => ({
    ...q,
    options: q.options.map((opt) => ({
      ...opt,
      categoryLinks: opt.categoryLinks || [],
    })),
  })));
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
  acc + q.options.filter(o => o.categoryLinks?.length > 0).length, 0
);
  const totalOptions = questions.reduce((acc, q) => acc + q.options.length, 0);

  // Detect orphaned category links — categoryId not found in current categories list
const brokenLinkCount = questions.reduce((acc, q) =>
  acc + q.options.reduce((oa, opt) =>
    oa + (opt.categoryLinks || []).filter(
      (cl) => !categories.find((c) => String(c._id) === String(cl.categoryId))
    ).length
  , 0)
, 0);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
  <div>
    <h1 className="text-xl font-semibold text-gray-900">{quizName} Builder</h1>
    <p className="text-sm text-gray-500 mt-0.5">
      Create questions to help customers discover the right products
    </p>
  </div>
  <button
    onClick={handleSave}
    disabled={saving}
    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60 transition-opacity hover:opacity-90 sm:flex-shrink-0"
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
      {!loading && brokenLinkCount > 0 && (
  <div className="border rounded-xl p-4 mb-5 flex gap-3 bg-red-50 border-red-200">
    <div className="flex-shrink-0 mt-0.5">
      <AlertTriangle size={16} className="text-red-400" />
    </div>
    <div>
      <p className="text-xs font-semibold text-red-800 mb-1">
        {brokenLinkCount} option{brokenLinkCount > 1 ? 's are' : ' is'} linked to deleted categories
      </p>
      <p className="text-xs text-red-700 leading-relaxed">
        These links no longer work and will hurt quiz accuracy. Please re-link the affected options
        using the <strong>Link to categories</strong> button, then save.
      </p>
    </div>
  </div>
)}
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
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 mb-4">
  <p className="text-xs text-gray-500">
    {questions.length}/5 questions · minimum 3 to publish
  </p>
  <div className="flex items-center gap-2 w-full xs:w-auto">
    <button
      onClick={handleLoadTemplate}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap"
    >
      <Wand2 size={13} />
      {isOtherType ? 'Template' : 'Load Template'}
    </button>
    <button
      onClick={addQuestion}
      disabled={questions.length >= 5}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-40 transition-opacity hover:opacity-90 whitespace-nowrap"
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