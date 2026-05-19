import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTenant } from '../../context/TenantContext';
import ShopHeader from '../../components/public/ShopHeader';
import ProductGrid from '../../components/public/ProductGrid';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ShopPage = () => {
  const { slug } = useParams();
  const { labels } = useTenant();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/public/${slug}/products`);
        const json = await res.json();
        if (json.success) setProducts(json.data);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  return (
    <div className="min-h-screen bg-white">
      <ShopHeader />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-6">
          <h1
            className="text-2xl font-semibold text-gray-900"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {labels.shop || 'Shop'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Browse our full collection</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl animate-pulse aspect-square" />
            ))}
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </div>

      <div className="h-12" />
    </div>
  );
};

export default ShopPage;