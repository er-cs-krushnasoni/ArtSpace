import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { BUSINESS_TYPE_OPTIONS } from '../../../config/businessTypeLabels';
import api from '../../../api/axiosInstance';
import toast from 'react-hot-toast';

function BusinessTypeSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  const filtered = query.trim()
    ? BUSINESS_TYPE_OPTIONS.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : BUSINESS_TYPE_OPTIONS;

  const selectedLabel = BUSINESS_TYPE_OPTIONS.find(o => o.value === value)?.label || '';

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
      >
        <span className={selectedLabel ? 'text-gray-900' : 'text-gray-400'}>
          {selectedLabel || 'Select type…'}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search business type…"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.map(opt => (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); setQuery(''); }}
                  className={`w-full text-left px-3.5 py-2 text-sm flex items-center justify-between transition-colors ${
                    value === opt.value
                      ? 'bg-violet-50 text-violet-700 font-medium'
                      : 'text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                  {value === opt.value && <Check className="w-3.5 h-3.5 text-violet-600" />}
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3.5 py-3 text-sm text-gray-400 text-center">No results found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function BusinessTypeSection({ initialData, onSaved }) {
  const [selected, setSelected] = useState(initialData?.businessType || 'generic');
  const [isSaving, setIsSaving] = useState(false);
  const isDirty = selected !== (initialData?.businessType || 'generic');

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put('/tenant/settings/business-type', { businessType: selected });
      onSaved?.({ businessType: selected });
      toast.success('Business type updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update business type');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-1">Business Type</h2>
      <p className="text-xs text-gray-400 mb-5">
        This controls labels and terminology used across your public shop (e.g. "Book Appointment", "Custom Order").
      </p>
      <div className="space-y-4">
        <BusinessTypeSelect value={selected} onChange={setSelected} />
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}