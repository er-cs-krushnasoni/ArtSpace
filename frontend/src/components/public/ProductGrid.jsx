import { useState, useEffect, useMemo } from 'react';
import { SlidersHorizontal, X, Search } from 'lucide-react';
import ProductCard from './ProductCard';
import ProductDetailModal from './ProductDetailModal';
import { useTenant } from '../../context/TenantContext';
import { getEffectivePrices } from './ProductCard';

// Sentinel value used internally for simple-tag categories (no sub-values)
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
  // Each group is: { name, values[], isSimpleTag }
  // isSimpleTag = true when a category has no values defined anywhere —
  // the group name itself acts as the filter chip.
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
          // No values anywhere — mark as simple tag
          groups[name].isSimpleTag = true;
        } else {
          // Value-based category — collect all visible values
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
      // No specific value — select all values in this group
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

  // ── Active chips for display ──────────────────────────────────────────────
  const activeChips = useMemo(() => {
    const chips = [];
    Object.entries(activeCategories).forEach(([group, vals]) => {
      vals.forEach((val) => {
        // For simple tags, show the group name as the chip label
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
          // Simple tag: just check if product has this category attached at all
          if (vals.has(SIMPLE_TAG_SENTINEL)) {
            return (p.categories || []).some(
              ({ categoryId }) => categoryId?.groupName === group
            );
          }
          // Value-based filter: product must have at least one matching value
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

  return (
    <div>
      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      {!limit && (
        <div className="flex items-center justify-between mb-4 gap-3">
          <p className="text-sm text-gray-500">
            Showing <span className="font-medium text-gray-900">{filteredProducts.length}</span>{' '}
            {labels.products || 'products'}
          </p>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:border-gray-300 transition-colors"
          >
            <SlidersHorizontal size={15} />
            Filters
            {hasActiveFilters && (
              <span
                className="w-4 h-4 rounded-full text-white text-xs flex items-center justify-center"
                style={{ background: 'var(--tenant-primary)', fontSize: '10px' }}
              >
                {activeChips.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* ── Filter panel ────────────────────────────────────────────────── */}
      {!limit && showFilters && (
        <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-4">
          {categoryGroups.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No category filters available</p>
          ) : (
            categoryGroups.map((group) => (
              <div key={group.name}>
                <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  {group.name}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {group.isSimpleTag ? (
                    // Simple tag category — one chip, group name is the label
                    <button
                      onClick={() => toggleSimpleTag(group.name)}
                      className="px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150"
                      style={
                        activeCategories[group.name]?.has(SIMPLE_TAG_SENTINEL)
                          ? { background: 'var(--tenant-primary)', color: '#fff', borderColor: 'var(--tenant-primary)' }
                          : { background: '#fff', color: '#4b5563', borderColor: '#e5e7eb' }
                      }
                    >
                      {group.name}
                    </button>
                  ) : (
                    // Value-based category — one chip per value
                    group.values.map((val) => {
                      const isOn = activeCategories[group.name]?.has(val);
                      return (
                        <button
                          key={val}
                          onClick={() => toggleCategoryValue(group.name, val)}
                          className="px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150"
                          style={
                            isOn
                              ? { background: 'var(--tenant-primary)', color: '#fff', borderColor: 'var(--tenant-primary)' }
                              : { background: '#fff', color: '#4b5563', borderColor: '#e5e7eb' }
                          }
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
            <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
              Price Range (₹)
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="w-24 px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400"
              />
              <span className="text-gray-400 text-sm">—</span>
              <input
                type="number"
                placeholder="Max"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="w-24 px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400"
              />
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="ml-auto text-xs text-gray-400 hover:text-gray-700 underline"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Active filter chips ──────────────────────────────────────────── */}
      {!limit && activeChips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {activeChips.map((chip, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-white"
              style={{ background: 'var(--tenant-primary)' }}
            >
              {chip.label}
              <button onClick={() => removeChip(chip)} className="ml-0.5 hover:opacity-70">
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* ── Product grid ─────────────────────────────────────────────────── */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search size={40} className="text-gray-200 mb-3" />
          <p className="text-sm font-medium text-gray-500">No products found</p>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="mt-2 text-sm underline"
              style={{ color: 'var(--tenant-primary)' }}
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onClick={() => setSelectedProduct(product)}
            />
          ))}
        </div>
      )}

      {/* ── Product detail modal ─────────────────────────────────────────── */}
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