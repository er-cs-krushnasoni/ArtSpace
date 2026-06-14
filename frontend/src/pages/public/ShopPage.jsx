import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTenant } from '../../context/TenantContext';
import ShopHeader from '../../components/public/ShopHeader';
import usePublicTheme from '../../hooks/usePublicTheme';
import ProductGrid from '../../components/public/ProductGrid';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ShopPage = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const { tenant, labels } = useTenant();
  const themeClass = usePublicTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const filterProductId  = searchParams.get('product');
  const filterCategoryId = searchParams.get('category');
  const filterValue      = searchParams.get('value');

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      try {
        const res  = await fetch(`${API_BASE}/public/${slug}/products`);
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
<div className={`min-h-screen ${themeClass}`} style={{ background: 'var(--tenant-bg)' }}>
        <ShopHeader />

      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Page heading */}
        <div className="mb-8">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-1"
            style={{ color: 'var(--tenant-primary)' }}
          >
            Browse
          </p>
          <div className="flex items-end gap-3 flex-wrap">
            <h1
              className="text-2xl sm:text-3xl font-bold leading-tight"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: 'var(--tenant-text, #1c1917)',
              }}
            >
              {labels.shop || 'Shop'}
            </h1>
            {/* Product count badge */}
            {!loading && products.length > 0 && (
              <span
                className="mb-0.5 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  background: 'color-mix(in srgb, var(--tenant-primary) 12%, transparent)',
                  color: 'var(--tenant-primary)',
                }}
              >
                {products.length} {products.length === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
          <p
            className="text-sm mt-1"
            style={{ color: 'color-mix(in srgb, var(--tenant-text, #1c1917) 50%, transparent)' }}
          >
            {loading ? 'Loading collection…' : 'Browse our full collection'}
          </p>
        </div>

        {/* Loading skeletons */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl animate-pulse aspect-square"
                style={{ background: 'color-mix(in srgb, var(--tenant-text, #1c1917) 7%, transparent)' }}
              />
            ))}
          </div>
        ) : (
          <ProductGrid
            products={products}
            initialProductId={filterProductId || null}
            initialCategoryId={filterProductId ? null : filterCategoryId}
            initialValue={filterValue || undefined}
          />
        )}

      </div>

      {/* Bottom breathing room */}
      <div className="h-16" />
    </div>
  );
};

export default ShopPage;