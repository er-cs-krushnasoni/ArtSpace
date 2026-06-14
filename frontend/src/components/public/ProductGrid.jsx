// frontend/src/components/public/ProductGrid.jsx
import { useState, useEffect, useMemo, useRef } from 'react';
import { SlidersHorizontal, X, Search, ChevronDown, ChevronUp } from 'lucide-react';
import ProductCard from './ProductCard';
import ProductDetailModal from './ProductDetailModal';
import { useTenant } from '../../context/TenantContext';
import { getEffectivePrices } from './ProductCard';

const SIMPLE_TAG_SENTINEL = '__tag__';

// ── Filter Sheet ──────────────────────────────────────────────────────────────
const FilterSheet = ({ categoryGroups, activeCategories, priceMin, priceMax, onToggleValue, onToggleSimpleTag, onPriceMin, onPriceMax, onClear, onClose, hasActiveFilters }) => {
const [expandedGroup, setExpandedGroup] = useState('__price__');
  const sheetRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const chipOn  = { background: 'var(--tenant-primary)', color: '#fff', borderColor: 'var(--tenant-primary)' };
  const chipOff = { background: 'transparent', color: 'var(--tenant-text, #374151)', borderColor: 'color-mix(in srgb, var(--tenant-text, #374151) 20%, transparent)' };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.45)' }}
    >
      <div
        ref={sheetRef}
        className="w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[85vh]"
        style={{
          background: 'var(--tenant-card-bg, #ffffff)',
          animation: 'filterSheetUp 0.25s cubic-bezier(0.34,1.1,0.64,1) both',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'color-mix(in srgb, var(--tenant-text, #374151) 8%, transparent)' }}
        >
          <p
            className="text-base font-bold"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--tenant-text, #111827)' }}
          >
            Filters
          </p>
          <div className="flex items-center gap-3">
            {hasActiveFilters && (
              <button
                onClick={onClear}
                className="text-xs font-semibold underline underline-offset-2 opacity-60 hover:opacity-100 transition-opacity"
                style={{ color: 'var(--tenant-text, #374151)' }}
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
              style={{ color: 'var(--tenant-text, #374151)' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
          {categoryGroups.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No category filters available</p>
          ) : (
            categoryGroups.map((group) => {
              const isExpanded = expandedGroup === group.name;
              const activeCount = group.isSimpleTag
                ? (activeCategories[group.name]?.has(SIMPLE_TAG_SENTINEL) ? 1 : 0)
                : (activeCategories[group.name]?.size || 0);

              return (
                <div
                  key={group.name}
                  className="rounded-xl overflow-hidden border"
                  style={{ borderColor: 'color-mix(in srgb, var(--tenant-text, #374151) 8%, transparent)' }}
                >
                  {/* Category header row */}
                  <button
                    type="button"
                    onClick={() => setExpandedGroup(isExpanded ? null : group.name)}
                    className="w-full flex items-center justify-between px-4 py-3 transition-colors"
                    style={{
                      background: activeCount > 0
                        ? 'color-mix(in srgb, var(--tenant-primary) 6%, var(--tenant-card-bg, #fff))'
                        : 'var(--tenant-card-bg, #fff)',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: activeCount > 0 ? 'var(--tenant-primary)' : 'var(--tenant-text, #111827)' }}
                      >
                        {group.name}
                      </span>
                      {activeCount > 0 && (
                        <span
                          className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white"
                          style={{ background: 'var(--tenant-primary)', fontSize: '10px' }}
                        >
                          {activeCount}
                        </span>
                      )}
                    </div>
                    {isExpanded
                      ? <ChevronUp size={15} style={{ color: 'var(--tenant-text, #6b7280)', opacity: 0.5 }} />
: <ChevronDown size={15} style={{ color: 'var(--tenant-text, #6b7280)', opacity: 0.5 }} />
                    }
                  </button>

                  {/* Sub-categories */}
                  {isExpanded && (
                    <div
                      className="px-4 pb-3 pt-2 border-t"
                      style={{ borderColor: 'color-mix(in srgb, var(--tenant-text, #374151) 6%, transparent)' }}
                    >
                      {group.isSimpleTag ? (
                        <button
                          onClick={() => onToggleSimpleTag(group.name)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all"
                          style={activeCategories[group.name]?.has(SIMPLE_TAG_SENTINEL) ? chipOn : chipOff}
                        >
                          {group.name}
                        </button>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {/* All option */}
                          <button
                            onClick={() => {
                              const allSelected = group.values.every(v => activeCategories[group.name]?.has(v));
                              if (allSelected) {
                                // deselect all
                                group.values.forEach(v => {
                                  if (activeCategories[group.name]?.has(v)) onToggleValue(group.name, v);
                                });
                              } else {
                                // select all missing
                                group.values.forEach(v => {
                                  if (!activeCategories[group.name]?.has(v)) onToggleValue(group.name, v);
                                });
                              }
                            }}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all"
                            style={
                              group.values.length > 0 && group.values.every(v => activeCategories[group.name]?.has(v))
                                ? chipOn
                                : chipOff
                            }
                          >
                            All
                          </button>
                          {group.values.map((val) => (
                            <button
                              key={val}
                              onClick={() => onToggleValue(group.name, val)}
                              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all"
                              style={activeCategories[group.name]?.has(val) ? chipOn : chipOff}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Price range */}
          <div
            className="rounded-xl border overflow-hidden"
            style={{ borderColor: 'color-mix(in srgb, var(--tenant-text, #374151) 8%, transparent)' }}
          >
            <button
              type="button"
              onClick={() => setExpandedGroup(expandedGroup === '__price__' ? null : '__price__')}
              className="w-full flex items-center justify-between px-4 py-3 transition-colors"
              style={{
                background: (priceMin || priceMax)
                  ? 'color-mix(in srgb, var(--tenant-primary) 6%, var(--tenant-card-bg, #fff))'
                  : 'var(--tenant-card-bg, #fff)',
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="text-sm font-semibold"
                  style={{ color: (priceMin || priceMax) ? 'var(--tenant-primary)' : 'var(--tenant-text, #111827)' }}
                >
                  Price Range
                </span>
                {(priceMin || priceMax) && (
                  <span
                    className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white"
                    style={{ background: 'var(--tenant-primary)', fontSize: '10px' }}
                  >
                    1
                  </span>
                )}
              </div>
              {expandedGroup === '__price__'
                ? <ChevronUp size={15} style={{ color: 'var(--tenant-text, #6b7280)', opacity: 0.5 }} />
: <ChevronDown size={15} style={{ color: 'var(--tenant-text, #6b7280)', opacity: 0.5 }} />
              }
            </button>
            {expandedGroup === '__price__' && (
              <div
                className="px-4 pb-3 pt-2 border-t"
                style={{ borderColor: 'color-mix(in srgb, var(--tenant-text, #374151) 6%, transparent)' }}
              >
                <div className="flex items-center gap-3 w-full">
                  <input
                    type="number"
                    placeholder="Min ₹"
                    value={priceMin}
                    onChange={(e) => onPriceMin(e.target.value)}
                    className="w-0 flex-1 px-3 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors"
                    style={{
                      borderColor: 'color-mix(in srgb, var(--tenant-text, #374151) 18%, transparent)',
                      background: 'var(--tenant-card-bg, #fff)',
                      color: 'var(--tenant-text, #111827)',
                    }}
                  />
                  <span className="flex-shrink-0 text-sm" style={{ color: 'var(--tenant-text, #9ca3af)', opacity: 0.4 }}>—</span>
                  <input
                    type="number"
                    placeholder="Max ₹"
                    value={priceMax}
                    onChange={(e) => onPriceMax(e.target.value)}
                    className="w-0 flex-1 px-3 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors"
                    style={{
                      borderColor: 'color-mix(in srgb, var(--tenant-text, #374151) 18%, transparent)',
                      background: 'var(--tenant-card-bg, #fff)',
                      color: 'var(--tenant-text, #111827)',
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-5 py-4 border-t flex-shrink-0"
          style={{ borderColor: 'color-mix(in srgb, var(--tenant-text, #374151) 8%, transparent)' }}
        >
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl text-sm font-bold transition-opacity hover:opacity-90"
            style={{ background: 'var(--tenant-primary)', color: 'var(--tenant-btn-text, #ffffff)' }}
          >
            Show Results
          </button>
        </div>
      </div>
      <style>{`
        @keyframes filterSheetUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

// ── ProductGrid ───────────────────────────────────────────────────────────────
const ProductGrid = ({ products, limit, initialProductId, initialCategoryId, initialValue }) => {
  const { labels } = useTenant();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeCategories, setActiveCategories] = useState({});
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [initialFilterApplied, setInitialFilterApplied] = useState(false);
  const [initialProductOpened, setInitialProductOpened] = useState(false);

  // ── Build category groups ─────────────────────────────────────────────────
  const categoryGroups = useMemo(() => {
    const groups = {};
    products.forEach((p) => {
      (p.categories || []).forEach(({ categoryId, selectedValues }) => {
        if (!categoryId?.groupName) return;
        const name = categoryId.groupName;
        if (!groups[name]) groups[name] = { values: new Set(), isSimpleTag: false };
        const hasDefinedValues  = categoryId.values?.length > 0;
        const hasSelectedValues = selectedValues?.length > 0;
        if (!hasDefinedValues && !hasSelectedValues) {
          groups[name].isSimpleTag = true;
        } else {
          const vals = hasSelectedValues ? selectedValues : categoryId.values;
          vals.forEach((v) => groups[name].values.add(v));
        }
      });
    });
    return Object.entries(groups).map(([name, { values, isSimpleTag }]) => ({
      name,
      values: [...values],
      isSimpleTag,
    }));
  }, [products]);

  // ── Apply initial category filter ─────────────────────────────────────────
  useEffect(() => {
    if (initialFilterApplied) return;
    if (!initialCategoryId || !products.length) return;
    let groupName = null;
    for (const p of products) {
      for (const entry of (p.categories || [])) {
        const catObj = entry.categoryId ?? entry;
        const catId  = (typeof catObj === 'object' ? catObj._id : catObj)?.toString();
        if (catId === initialCategoryId) { groupName = catObj.groupName ?? null; break; }
      }
      if (groupName) break;
    }
    if (!groupName) return;
    const group = categoryGroups.find((g) => g.name === groupName);
    if (group?.isSimpleTag) {
      setActiveCategories({ [groupName]: new Set([SIMPLE_TAG_SENTINEL]) });
    } else if (initialValue) {
      setActiveCategories({ [groupName]: new Set([initialValue]) });
    } else if (group?.values.length) {
      setActiveCategories({ [groupName]: new Set(group.values) });
    }
    setInitialFilterApplied(true);
  }, [initialCategoryId, initialValue, products, initialFilterApplied, categoryGroups]);

  // ── Open initial product ──────────────────────────────────────────────────
  useEffect(() => {
    if (initialProductOpened || !initialProductId || !products.length) return;
    const found = products.find((p) => p._id === initialProductId);
    if (found) { setSelectedProduct(found); setInitialProductOpened(true); }
  }, [initialProductId, products, initialProductOpened]);

  // ── Filter toggle helpers ─────────────────────────────────────────────────
  const toggleCategoryValue = (groupName, value) => {
    setActiveCategories((prev) => {
      const current = new Set(prev[groupName] || []);
      if (current.has(value)) current.delete(value); else current.add(value);
      return { ...prev, [groupName]: current };
    });
  };
  const toggleSimpleTag = (groupName) => {
    setActiveCategories((prev) => {
      const current = new Set(prev[groupName] || []);
      if (current.has(SIMPLE_TAG_SENTINEL)) current.delete(SIMPLE_TAG_SENTINEL);
      else current.add(SIMPLE_TAG_SENTINEL);
      return { ...prev, [groupName]: current };
    });
  };
  const clearAllFilters = () => {
    setActiveCategories({});
    setPriceMin('');
    setPriceMax('');
    setSearchQuery('');
  };

  const hasActiveFilters =
    Object.values(activeCategories).some((s) => s.size > 0) ||
    priceMin !== '' || priceMax !== '' || searchQuery.trim() !== '';

  // ── Active chips ──────────────────────────────────────────────────────────
  const activeChips = useMemo(() => {
    const chips = [];
    if (searchQuery.trim()) chips.push({ type: 'search', label: `"${searchQuery.trim()}"` });
    Object.entries(activeCategories).forEach(([group, vals]) => {
      vals.forEach((val) => {
        const label = val === SIMPLE_TAG_SENTINEL ? group : val;
        chips.push({ type: 'category', group, val, label });
      });
    });
    if (priceMin) chips.push({ type: 'price_min', label: `Min ₹${priceMin}` });
    if (priceMax) chips.push({ type: 'price_max', label: `Max ₹${priceMax}` });
    return chips;
  }, [activeCategories, priceMin, priceMax, searchQuery]);

  // ── Filtered products ─────────────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    let result = products;

    // Search filter
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((p) => p.name?.toLowerCase().includes(q));
    }

    // Category filter
    const activeCatEntries = Object.entries(activeCategories).filter(([, s]) => s.size > 0);
    if (activeCatEntries.length > 0) {
      result = result.filter((p) =>
        activeCatEntries.every(([group, vals]) => {
          if (vals.has(SIMPLE_TAG_SENTINEL)) {
            return (p.categories || []).some(({ categoryId }) => categoryId?.groupName === group);
          }
          return (p.categories || []).some(({ categoryId, selectedValues }) => {
            if (categoryId?.groupName !== group) return false;
            const checkVals = selectedValues?.length > 0 ? selectedValues : (categoryId.values || []);
            return checkVals.some((v) => vals.has(v));
          });
        })
      );
    }

    // Price filter
    const min = parseFloat(priceMin);
    const max = parseFloat(priceMax);
    if (!isNaN(min) || !isNaN(max)) {
      result = result.filter((p) => {
        const prices   = getEffectivePrices(p);
        const relevant = [prices.delivery, prices.appointment].filter((x) => x > 0);
        if (relevant.length === 0) return true;
        const lowest = Math.min(...relevant);
        if (!isNaN(min) && lowest < min) return false;
        if (!isNaN(max) && lowest > max) return false;
        return true;
      });
    }

    if (limit) result = result.slice(0, limit);
    return result;
  }, [products, activeCategories, priceMin, priceMax, searchQuery, limit]);

  // ── Remove a single chip ──────────────────────────────────────────────────
  const removeChip = (chip) => {
    if (chip.type === 'search') setSearchQuery('');
    else if (chip.type === 'category') {
      setActiveCategories((prev) => {
        const current = new Set(prev[chip.group] || []);
        current.delete(chip.val);
        return { ...prev, [chip.group]: current };
      });
    } else if (chip.type === 'price_min') setPriceMin('');
    else if (chip.type === 'price_max') setPriceMax('');
  };

  const totalActiveFilters = activeChips.filter(c => c.type !== 'search').length;

  return (
    <div>
      {/* ── Search + Filter row ───────────────────────────────────────────── */}
      {!limit && (
        <div className="flex items-center gap-2 mb-4">
          {/* Search input */}
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'color-mix(in srgb, var(--tenant-text, #374151) 35%, transparent)' }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors"
              style={{
                background: 'var(--tenant-card-bg, #ffffff)',
                borderColor: 'color-mix(in srgb, var(--tenant-text, #374151) 15%, transparent)',
                color: 'var(--tenant-text, #111827)',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:opacity-70 transition-opacity"
                style={{ color: 'color-mix(in srgb, var(--tenant-text, #374151) 40%, transparent)' }}
              >
                <X size={13} />
              </button>
            )}
          </div>
          {/* Filters button */}
          <button
            onClick={() => setShowFilters(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all flex-shrink-0"
            style={{
              background: totalActiveFilters > 0 ? 'var(--tenant-primary)' : 'var(--tenant-card-bg, #ffffff)',
              color: totalActiveFilters > 0 ? '#fff' : 'var(--tenant-text, #374151)',
              borderColor: totalActiveFilters > 0 ? 'var(--tenant-primary)' : 'color-mix(in srgb, var(--tenant-text, #374151) 15%, transparent)',
            }}
          >
            <SlidersHorizontal size={14} />
            Filters
            {totalActiveFilters > 0 && (
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-white"
                style={{ background: 'rgba(255,255,255,0.25)', fontSize: '10px' }}
              >
                {totalActiveFilters}
              </span>
            )}
          </button>
        </div>
      )}

      {/* ── Active chips ──────────────────────────────────────────────────── */}
      {!limit && activeChips.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          {activeChips.map((chip, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold"
              style={{
                background: chip.type === 'search'
                  ? 'color-mix(in srgb, var(--tenant-primary) 12%, transparent)'
                  : 'var(--tenant-primary)',
                color: chip.type === 'search' ? 'var(--tenant-primary)' : '#fff',
              }}
            >
              {chip.type === 'search' && <Search size={10} />}
              {chip.label}
              <button
                onClick={() => removeChip(chip)}
                className="ml-0.5 hover:opacity-70 transition-opacity"
              >
                <X size={11} />
              </button>
            </span>
          ))}
          {activeChips.length > 1 && (
            <button
              onClick={clearAllFilters}
              className="text-xs font-medium underline underline-offset-2 opacity-50 hover:opacity-80 transition-opacity"
              style={{ color: 'var(--tenant-text, #374151)' }}
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* ── Result count ──────────────────────────────────────────────────── */}
      {!limit && (
        <p className="text-sm mb-5" style={{ color: 'color-mix(in srgb, var(--tenant-text, #374151) 50%, transparent)' }}>
          Showing{' '}
          <span className="font-semibold" style={{ color: 'var(--tenant-text, #111827)' }}>
            {filteredProducts.length}
          </span>{' '}
          {labels.products || 'products'}
        </p>
      )}

      {/* ── Product grid ──────────────────────────────────────────────────── */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'color-mix(in srgb, var(--tenant-primary) 8%, transparent)' }}
          >
            <Search size={28} style={{ color: 'var(--tenant-primary)', opacity: 0.5 }} />
          </div>
          <p
            className="text-base font-semibold mb-1"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--tenant-text, #374151)' }}
          >
            No products found
          </p>
          <p className="text-sm mb-4" style={{ color: 'color-mix(in srgb, var(--tenant-text, #374151) 45%, transparent)' }}>
            Try adjusting your search or filters
          </p>
          {hasActiveFilters && (
            <button
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ background: 'var(--tenant-primary)', color: '#fff' }}
              onClick={clearAllFilters}
            >
              Clear all
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filteredProducts.map((product, index) => (
            <div
              key={product._id}
              className="animate-fadeUp"
              style={{ animationDelay: `${Math.min(index * 40, 300)}ms`, animationFillMode: 'both' }}
            >
              <ProductCard
                product={product}
                onClick={() => setSelectedProduct(product)}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Filter sheet ──────────────────────────────────────────────────── */}
      {showFilters && (
        <FilterSheet
          categoryGroups={categoryGroups}
          activeCategories={activeCategories}
          priceMin={priceMin}
          priceMax={priceMax}
          onToggleValue={toggleCategoryValue}
          onToggleSimpleTag={toggleSimpleTag}
          onPriceMin={setPriceMin}
          onPriceMax={setPriceMax}
          onClear={clearAllFilters}
          onClose={() => setShowFilters(false)}
          hasActiveFilters={hasActiveFilters}
        />
      )}

      {/* ── Product detail modal ──────────────────────────────────────────── */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};

export default ProductGrid;