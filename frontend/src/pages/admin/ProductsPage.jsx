import { useState, useEffect } from 'react';
import { Plus, Package, AlertTriangle } from 'lucide-react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import ProductCard from '../../components/admin/products/ProductCard';
import ProductFormModal from '../../components/admin/products/ProductFormModal';
import DiscountModal from '../../components/admin/products/DiscountModal';
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
  const [formModal, setFormModal] = useState(null); // null | 'create' | product object
  const [discountModal, setDiscountModal] = useState(null); // null | product object
  const [deleteConfirm, setDeleteConfirm] = useState(null); // null | product object
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    fetchAll();
  }, []);
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
  const filteredProducts = products.filter((p) => {
    if (filter === 'active') return p.isActive;
    if (filter === 'inactive') return !p.isActive;
    return true;
  });
  const stats = {
    total: products.length,
    active: products.filter((p) => p.isActive).length,
    onDiscount: products.filter((p) => p.discount?.isActive).length,
  };
  const handleSaved = (saved, action) => {
    if (action === 'create') {
      setProducts((prev) => [saved, ...prev]);
    } else {
      setProducts((prev) => prev.map((p) => (p._id === saved._id ? saved : p)));
    }
  };
  const handleDiscountUpdated = (updated) => {
    setProducts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
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
      {/* Filter pills */}
      <div className="flex gap-2 mb-5">
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
            {filter === 'all' ? 'No products yet' : `No ${filter} products`}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {filter === 'all' ? 'Add your first product to get started' : 'Try a different filter'}
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
              onEdit={(p) => setFormModal(p)}
              onDiscount={(p) => setDiscountModal(p)}
              onDelete={(p) => setDeleteConfirm(p)}
            />
          ))}
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
      {/* Discount modal */}
      {discountModal && (
        <DiscountModal
          product={discountModal}
          onClose={() => setDiscountModal(null)}
          onUpdated={handleDiscountUpdated}
          deliveryEnabled={deliveryEnabled}
          appointmentEnabled={appointmentEnabled}
        />
      )}
    </div>
  );
}