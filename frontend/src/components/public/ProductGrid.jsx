// frontend/src/components/public/ProductGrid.jsx
import { useState, useEffect, useMemo } from 'react';
import { SlidersHorizontal, X, Search } from 'lucide-react';
import ProductCard from './ProductCard';
import ProductDetailModal from './ProductDetailModal';
import { useTenant } from '../../context/TenantContext';
import { getEffectivePrices } from './ProductCard';

const SIMPLE_TAG_SENTINEL = '__tag__';

const ProductGrid = ({ products, limit, initialProductId, initialCategoryId, initialValue }) => {
  const { labels } = useTenant();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeCategories, setActiveCategories] = useState({});
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [initialFilterApplied, setInitialFilterApplied] = useState(false);
  const [initialProductOpened, setInitialProductOpened] = useState(false);

  // ── Build category groups from products ───────────────────────────────────
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

  // ── Apply initial category filter from URL params ─────────────────────────
  useEffect(() => {
    if (initialFilterApplied) return;
    if (!initialCategoryId || !products.length) return;
    let groupName = null;
    for (const p of products) {
      for (const entry of (p.categories || [])) {
        const catObj = entry.categoryId ?? entry;
        const catId  = (typeof catObj === 'object' ? catObj._id : catObj)?.toString();
        if (catId === initialCategoryId) {
          groupName = catObj.groupName ?? null;
          break;
        }
      }
      if (groupName) break;
    }
    if (!groupName) return;
    const group = categoryGroups.find((g) => g.name === groupName);
    if (group?.isSimpleTag) {
      setActiveCategories({ [groupName]: new Set([SIMPLE_TAG_SENTINEL]) });
    } else if (initialValue) {
      setActiveCategories({ [groupName]: new Set([initialValue]) });
    } else {
      if (group?.values.length) {
        setActiveCategories({ [groupName]: new Set(group.values) });
      }
    }
    setInitialFilterApplied(true);
  }, [initialCategoryId, initialValue, products, initialFilterApplied, categoryGroups]);

  // ── Open initial product modal from URL params ────────────────────────────
  useEffect(() => {
    if (initialProductOpened || !initialProductId || !products.length) return;
    const found = products.find((p) => p._id === initialProductId);
    if (found) {
      setSelectedProduct(found);
      setInitialProductOpened(true);
    }
  }, [initialProductId, products, initialProductOpened]);

  // ── Filter toggle helpers ─────────────────────────────────────────────────
  const toggleCategoryValue = (groupName, value) => {
    setActiveCategories((prev) => {
      const current = new Set(prev[groupName] || []);
      if (current.has(value)) current.delete(value);
      else current.add(value);
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
  };

  const hasActiveFilters =
    Object.values(activeCategories).some((s) => s.size > 0) ||
    priceMin !== '' ||
    priceMax !== '';

  // ── Active chips ──────────────────────────────────────────────────────────
  const activeChips = useMemo(() => {
    const chips = [];
    Object.entries(activeCategories).forEach(([group, vals]) => {
      vals.forEach((val) => {
        const label = val === SIMPLE_TAG_SENTINEL ? group : val;
        chips.push({ type: 'category', group, val, label });
      });
    });
    if (priceMin) chips.push({ type: 'price_min', label: `Min ₹${priceMin}` });
    if (priceMax) chips.push({ type: 'price_max', label: `Max ₹${priceMax}` });
    return chips;
  }, [activeCategories, priceMin, priceMax]);

  // ── Filtered products ─────────────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    let result = products;
    const activeCatEntries = Object.entries(activeCategories).filter(([, s]) => s.size > 0);
    if (activeCatEntries.length > 0) {
      result = result.filter((p) =>
        activeCatEntries.every(([group, vals]) => {
          if (vals.has(SIMPLE_TAG_SENTINEL)) {
            return (p.categories || []).some(
              ({ categoryId }) => categoryId?.groupName === group
            );
          }
          return (p.categories || []).some(({ categoryId, selectedValues }) => {
            if (categoryId?.groupName !== group) return false;
            const checkVals = selectedValues?.length > 0
              ? selectedValues
              : (categoryId.values || []);
            return checkVals.some((v) => vals.has(v));
          });
        })
      );
    }
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
  }, [products, activeCategories, priceMin, priceMax, limit]);

  // ── Remove a single chip ──────────────────────────────────────────────────
  const removeChip = (chip) => {
    if (chip.type === 'category') {
      setActiveCategories((prev) => {
        const current = new Set(prev[chip.group] || []);
        current.delete(chip.val);
        return { ...prev, [chip.group]: current };
      });
    } else if (chip.type === 'price_min') setPriceMin('');
    else if (chip.type === 'price_max') setPriceMax('');
  };

  // ── Active filter chip style helpers ─────────────────────────────────────
  const chipOn  = { background: 'var(--tenant-primary)', color: '#fff', borderColor: 'var(--tenant-primary)' };
  const chipOff = { background: 'transparent', color: 'var(--tenant-nav-text, #374151)', borderColor: 'color-mix(in srgb, var(--tenant-nav-text, #374151) 20%, transparent)' };

  return (
    <div>
      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      {!limit && (
        <div className="flex items-center justify-between mb-5 gap-3">
          <p className="text-sm dark:text-zinc-400" style={{ color: 'var(--tenant-nav-text, #6b7280)' }}>
            Showing{' '}
            <span className="font-semibold dark:text-zinc-200" style={{ color: 'var(--tenant-nav-text, #111827)' }}>
              {filteredProducts.length}
            </span>{' '}
            {labels.products || 'products'}
          </p>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-150"
            style={
              showFilters
                ? { background: 'var(--tenant-primary)', color: '#fff', borderColor: 'var(--tenant-primary)' }
                : {
                    background: 'var(--tenant-card-bg, #fff)',
                    color: 'var(--tenant-nav-text, #374151)',
                    borderColor: 'color-mix(in srgb, var(--tenant-nav-text, #374151) 18%, transparent)',
                  }
            }
          >
            <SlidersHorizontal size={14} />
            Filters
            {hasActiveFilters && (
              <span
                className="w-5 h-5 rounded-full text-white flex items-center justify-center font-bold"
                style={{
                  background: showFilters ? 'rgba(255,255,255,0.3)' : 'var(--tenant-primary)',
                  fontSize: '10px',
                }}
              >
                {activeChips.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* ── Filter panel ─────────────────────────────────────────────────── */}
      {!limit && showFilters && (
        <div
          className="mb-6 p-5 rounded-2xl border space-y-5 dark:border-zinc-700/60"
          style={{
            background: 'color-mix(in srgb, var(--tenant-card-bg, #fff) 60%, var(--tenant-bg, #fafaf9))',
            borderColor: 'color-mix(in srgb, var(--tenant-nav-text, #374151) 10%, transparent)',
          }}
        >
          {categoryGroups.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-zinc-500 italic">No category filters available</p>
          ) : (
            categoryGroups.map((group) => (
              <div key={group.name}>
                <p
                  className="text-xs font-bold mb-2.5 uppercase tracking-widest dark:text-zinc-400"
                  style={{ color: 'var(--tenant-nav-text, #6b7280)', opacity: 0.7 }}
                >
                  {group.name}
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.isSimpleTag ? (
                    <button
                      onClick={() => toggleSimpleTag(group.name)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150"
                      style={
                        activeCategories[group.name]?.has(SIMPLE_TAG_SENTINEL)
                          ? chipOn
                          : chipOff
                      }
                    >
                      {group.name}
                    </button>
                  ) : (
                    group.values.map((val) => {
                      const isOn = activeCategories[group.name]?.has(val);
                      return (
                        <button
                          key={val}
                          onClick={() => toggleCategoryValue(group.name, val)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150"
                          style={isOn ? chipOn : chipOff}
                        >
                          {val}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            ))
          )}

          {/* Price range */}
          <div>
            <p
              className="text-xs font-bold mb-2.5 uppercase tracking-widest dark:text-zinc-400"
              style={{ color: 'var(--tenant-nav-text, #6b7280)', opacity: 0.7 }}
            >
              Price Range (₹)
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="number"
                placeholder="Min"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="w-24 px-3 py-2 rounded-xl border text-sm focus:outline-none transition-colors dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-600"
                style={{ borderColor: 'color-mix(in srgb, var(--tenant-nav-text, #374151) 18%, transparent)' }}
              />
              <span className="text-gray-300 dark:text-zinc-600 text-sm font-light">—</span>
              <input
                type="number"
                placeholder="Max"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="w-24 px-3 py-2 rounded-xl border text-sm focus:outline-none transition-colors dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-600"
                style={{ borderColor: 'color-mix(in srgb, var(--tenant-nav-text, #374151) 18%, transparent)' }}
              />
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="ml-auto text-xs font-medium underline underline-offset-2 opacity-60 hover:opacity-100 transition-opacity dark:text-zinc-400"
                  style={{ color: 'var(--tenant-nav-text, #6b7280)' }}
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Active filter chips ───────────────────────────────────────────── */}
      {!limit && activeChips.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {activeChips.map((chip, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold text-white"
              style={{ background: 'var(--tenant-primary)' }}
            >
              {chip.label}
              <button
                onClick={() => removeChip(chip)}
                className="ml-0.5 hover:opacity-70 transition-opacity"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
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
            className="text-base font-semibold mb-1 dark:text-zinc-300"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--tenant-nav-text, #374151)' }}
          >
            No products found
          </p>
          <p className="text-sm text-gray-400 dark:text-zinc-500 mb-4">
            Try adjusting your filters
          </p>
          {hasActiveFilters && (
            <button
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ background: 'var(--tenant-primary)', color: '#fff' }}
              onClick={clearAllFilters}
            >
              Clear filters
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