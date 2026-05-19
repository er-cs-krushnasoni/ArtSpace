import { useState, useMemo } from 'react';
import { SlidersHorizontal, X, Search } from 'lucide-react';
import ProductCard from './ProductCard';
import ProductDetailModal from './ProductDetailModal';
import { useTenant } from '../../context/TenantContext';
import { getEffectivePrices } from './ProductCard';

const ProductGrid = ({ products, limit }) => {
  const { labels } = useTenant();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeCategories, setActiveCategories] = useState({}); // { groupName: Set of values }
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Build category groups from products
  const categoryGroups = useMemo(() => {
    const groups = {};
    products.forEach((p) => {
      (p.categories || []).forEach((cat) => {
        if (!groups[cat.groupName]) groups[cat.groupName] = new Set();
        (cat.values || []).forEach((v) => groups[cat.groupName].add(v));
      });
    });
    return Object.entries(groups).map(([name, vals]) => ({ name, values: [...vals] }));
  }, [products]);

  const toggleCategoryValue = (groupName, value) => {
    setActiveCategories((prev) => {
      const current = new Set(prev[groupName] || []);
      if (current.has(value)) current.delete(value);
      else current.add(value);
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

  const activeChips = useMemo(() => {
    const chips = [];
    Object.entries(activeCategories).forEach(([group, vals]) => {
      vals.forEach((val) => chips.push({ type: 'category', group, val, label: val }));
    });
    if (priceMin) chips.push({ type: 'price_min', label: `Min ₹${priceMin}` });
    if (priceMax) chips.push({ type: 'price_max', label: `Max ₹${priceMax}` });
    return chips;
  }, [activeCategories, priceMin, priceMax]);

  const filteredProducts = useMemo(() => {
    let result = products;

    // Category filter
    const activeCatEntries = Object.entries(activeCategories).filter(([, s]) => s.size > 0);
    if (activeCatEntries.length > 0) {
      result = result.filter((p) =>
        activeCatEntries.every(([group, vals]) =>
          (p.categories || []).some(
            (cat) => cat.groupName === group && (cat.values || []).some((v) => vals.has(v))
          )
        )
      );
    }

    // Price filter — uses min of delivery/appointment effective price
    const min = parseFloat(priceMin);
    const max = parseFloat(priceMax);
    if (!isNaN(min) || !isNaN(max)) {
      result = result.filter((p) => {
        const prices = getEffectivePrices(p);
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
      {/* Toolbar */}
      {!limit && (
        <div className="flex items-center justify-between mb-4 gap-3">
          <p className="text-sm text-gray-500">
            Showing <span className="font-medium text-gray-900">{filteredProducts.length}</span> {labels.products || 'products'}
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

      {/* Filter panel */}
      {!limit && showFilters && (
        <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-4">
          {categoryGroups.map((group) => (
            <div key={group.name}>
              <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">{group.name}</p>
              <div className="flex flex-wrap gap-1.5">
                {group.values.map((val) => {
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
                })}
              </div>
            </div>
          ))}

          {/* Price range */}
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Price Range (₹)</p>
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

      {/* Active filter chips */}
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

      {/* Grid */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search size={40} className="text-gray-200 mb-3" />
          <p className="text-sm font-medium text-gray-500">No products found</p>
          {hasActiveFilters && (
            <button onClick={clearAllFilters} className="mt-2 text-sm underline" style={{ color: 'var(--tenant-primary)' }}>
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

      {/* Product detail modal */}
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