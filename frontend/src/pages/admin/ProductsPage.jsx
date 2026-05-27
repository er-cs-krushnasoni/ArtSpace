import { useState, useEffect, useMemo } from 'react';
import { Plus, Package, AlertTriangle, Search, X, SlidersHorizontal, CheckSquare, Square } from 'lucide-react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import ProductCard from '../../components/admin/products/ProductCard';
import ProductFormModal from '../../components/admin/products/ProductFormModal';
import DiscountModal from '../../components/admin/products/DiscountModal';
import BulkDiscountModal from '../../components/admin/products/BulkDiscountModal';
import BulkRemoveDiscountModal from '../../components/admin/products/BulkRemoveDiscountModal';
import BulkStatusModal from '../../components/admin/products/BulkStatusModal';

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [deliveryEnabled, setDeliveryEnabled] = useState(true);
  const [appointmentEnabled, setAppointmentEnabled] = useState(true);
  const [formModal, setFormModal] = useState(null);
  const [discountModal, setDiscountModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  // ── Search & filter state ──────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  // ── Selection state ────────────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkDiscountModal, setBulkDiscountModal] = useState(false);
  const [bulkRemoveModal, setBulkRemoveModal] = useState(false);
  const [bulkStatusModal, setBulkStatusModal] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, settingsRes] = await Promise.all([
        api.get('/tenant/products'),
        api.get('/tenant/categories'),
        api.get('/tenant/settings'),
      ]);
      setProducts(prodRes.data.data || []);
      setCategories(catRes.data.data || []);
      const wc = settingsRes.data.data?.websiteConfig || {};
      setDeliveryEnabled(wc.deliveryEnabled ?? true);
      setAppointmentEnabled(wc.appointmentEnabled ?? true);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // ── Derived filtered list ──────────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (filter === 'active' && !p.isActive) return false;
      if (filter === 'inactive' && p.isActive) return false;
      if (search.trim()) {
        if (!p.name.toLowerCase().includes(search.trim().toLowerCase())) return false;
      }
      const prices = [
        deliveryEnabled && p.deliveryPrice != null ? p.deliveryPrice : null,
        appointmentEnabled && p.appointmentPrice != null ? p.appointmentPrice : null,
      ].filter((v) => v !== null);
      const minPrice = prices.length ? Math.min(...prices) : 0;
      if (priceMin !== '' && minPrice < parseFloat(priceMin)) return false;
      if (priceMax !== '' && minPrice > parseFloat(priceMax)) return false;
      if (selectedCategories.length > 0) {
        const productCatIds = (p.categories || []).map((c) => c._id);
        if (!selectedCategories.some((cid) => productCatIds.includes(cid))) return false;
      }
      return true;
    });
  }, [products, filter, search, priceMin, priceMax, selectedCategories, deliveryEnabled, appointmentEnabled]);

  const stats = {
    total: products.length,
    active: products.filter((p) => p.isActive).length,
    onDiscount: products.filter((p) => p.discount?.isActive).length,
  };

  const hasActiveFilters = search || priceMin || priceMax || selectedCategories.length > 0;

  const clearFilters = () => {
    setSearch('');
    setPriceMin('');
    setPriceMax('');
    setSelectedCategories([]);
  };

  // ── Category pill toggle ───────────────────────────────────────────────────
  const toggleCategory = (catId) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  // ── Selection helpers ──────────────────────────────────────────────────────
  const toggleSelect = (product) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(product._id)) next.delete(product._id);
      else next.add(product._id);
      return next;
    });
  };

  const isAllSelected = filteredProducts.length > 0 && filteredProducts.every((p) => selectedIds.has(p._id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredProducts.forEach((p) => next.delete(p._id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredProducts.forEach((p) => next.add(p._id));
        return next;
      });
    }
  };

  const clearSelection = () => setSelectedIds(new Set());
  const selectedProducts = products.filter((p) => selectedIds.has(p._id));

  // ── Update helpers ─────────────────────────────────────────────────────────
  const handleSaved = (saved, action) => {
    if (action === 'create') setProducts((prev) => [saved, ...prev]);
    else setProducts((prev) => prev.map((p) => (p._id === saved._id ? saved : p)));
  };

  const handleDiscountUpdated = (updated) => {
    setProducts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
  };

  const handleBulkUpdated = (updatedList) => {
    setProducts((prev) => {
      const map = Object.fromEntries(updatedList.map((u) => [u._id, u]));
      return prev.map((p) => map[p._id] || p);
    });
    clearSelection();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await api.delete(`/tenant/products/${deleteConfirm._id}`);
      setProducts((prev) => prev.filter((p) => p._id !== deleteConfirm._id));
      setDeleteConfirm(null);
      toast.success('Product deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your shop catalogue</p>
        </div>
        <button
          onClick={() => setFormModal('create')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-all hover:opacity-90"
          style={{ background: 'var(--color-primary, #8b5cf6)' }}
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Products', value: stats.total },
          { label: 'Active', value: stats.active },
          { label: 'On Discount', value: stats.onDiscount },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Status filter pills */}
      <div className="flex gap-2 mb-4">
        {FILTERS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className="px-3 py-1.5 rounded-full text-sm font-medium border transition-all"
            style={
              filter === value
                ? { background: '#ede9fe', color: '#6d28d9', borderColor: '#c4b5fd' }
                : { background: 'white', color: '#6b7280', borderColor: '#e5e7eb' }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search + Filter bar */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium border rounded-lg transition-all"
          style={
            showFilters || hasActiveFilters
              ? { background: '#ede9fe', color: '#6d28d9', borderColor: '#c4b5fd' }
              : { background: 'white', color: '#6b7280', borderColor: '#e5e7eb' }
          }
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="w-4 h-4 rounded-full bg-violet-600 text-white text-[10px] font-bold flex items-center justify-center">
              {[search, priceMin || priceMax, selectedCategories.length > 0].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Expandable filter panel */}
      {showFilters && (
        <div className="mb-4 p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Price Range (₹)</label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                <input
                  type="number"
                  min="0"
                  placeholder="Min"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="w-full pl-6 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 bg-white"
                />
              </div>
              <span className="text-gray-400 text-sm flex-shrink-0">to</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                <input
                  type="number"
                  min="0"
                  placeholder="Max"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="w-full pl-6 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 bg-white"
                />
              </div>
            </div>
          </div>
          {categories.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Categories</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => toggleCategory(cat._id)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                    style={
                      selectedCategories.includes(cat._id)
                        ? { background: '#ede9fe', color: '#6d28d9', borderColor: '#c4b5fd' }
                        : { background: 'white', color: '#6b7280', borderColor: '#e5e7eb' }
                    }
                  >
                    {cat.groupName}
                  </button>
                ))}
              </div>
            </div>
          )}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs font-medium text-red-500 hover:text-red-600 flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Select all bar */}
      {!loading && filteredProducts.length > 0 && (
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-all"
          >
            {isAllSelected
              ? <CheckSquare className="w-4 h-4 text-violet-600" />
              : <Square className="w-4 h-4" />
            }
            {isAllSelected ? 'Deselect all' : `Select all (${filteredProducts.length})`}
          </button>
          {selectedIds.size > 0 && (
            <span className="text-xs text-violet-700 font-medium bg-violet-50 px-2 py-1 rounded-full">
              {selectedIds.size} selected
            </span>
          )}
        </div>
      )}

      {/* Product grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="w-10 h-10 text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-500">
            {hasActiveFilters || search ? 'No products match your filters' : filter === 'all' ? 'No products yet' : `No ${filter} products`}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {hasActiveFilters || search ? 'Try adjusting your search or filters' : filter === 'all' ? 'Add your first product to get started' : 'Try a different filter'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              deliveryEnabled={deliveryEnabled}
              appointmentEnabled={appointmentEnabled}
              selected={selectedIds.has(product._id)}
              onSelect={toggleSelect}
              onEdit={(p) => setFormModal(p)}
              onDiscount={(p) => setDiscountModal(p)}
              onDelete={(p) => setDeleteConfirm(p)}
            />
          ))}
        </div>
      )}

      {/* Floating bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-5 py-3 bg-gray-900 text-white rounded-2xl shadow-2xl">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <div className="w-px h-4 bg-white/20" />
          <button
            onClick={() => setBulkStatusModal(true)}
            className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg transition-all"
          >
            Set Status
          </button>
          <button
            onClick={() => setBulkDiscountModal(true)}
            className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 bg-violet-600 hover:bg-violet-500 rounded-lg transition-all"
          >
            Apply Discount
          </button>
          <button
            onClick={() => setBulkRemoveModal(true)}
            className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg transition-all"
          >
            Remove Discount
          </button>
          <button
            onClick={clearSelection}
            className="text-gray-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Delete product?</h3>
                <p className="text-sm text-gray-500 mt-1">
                  <span className="font-medium">{deleteConfirm.name}</span> and all its photos will be permanently deleted.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all disabled:opacity-60"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product form modal */}
      {formModal && (
        <ProductFormModal
          product={formModal === 'create' ? null : formModal}
          allCategories={categories}
          deliveryEnabled={deliveryEnabled}
          appointmentEnabled={appointmentEnabled}
          onClose={() => setFormModal(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Single discount modal */}
      {discountModal && (
        <DiscountModal
          product={discountModal}
          onClose={() => setDiscountModal(null)}
          onUpdated={handleDiscountUpdated}
          deliveryEnabled={deliveryEnabled}
          appointmentEnabled={appointmentEnabled}
        />
      )}

      {/* Bulk apply discount modal */}
      {bulkDiscountModal && (
        <BulkDiscountModal
          products={selectedProducts}
          onClose={() => setBulkDiscountModal(false)}
          onAllUpdated={handleBulkUpdated}
          deliveryEnabled={deliveryEnabled}
          appointmentEnabled={appointmentEnabled}
        />
      )}

      {/* Bulk remove discount modal */}
      {bulkRemoveModal && (
        <BulkRemoveDiscountModal
          products={selectedProducts}
          onClose={() => setBulkRemoveModal(false)}
          onAllUpdated={handleBulkUpdated}
        />
      )}

      {/* Bulk status modal */}
      {bulkStatusModal && (
        <BulkStatusModal
          products={selectedProducts}
          onClose={() => setBulkStatusModal(false)}
          onAllUpdated={handleBulkUpdated}
        />
      )}
    </div>
  );
}