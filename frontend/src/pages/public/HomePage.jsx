import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, ShoppingBag, MapPin, Mail,ChevronDown, ChevronUp } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import ShopHeader from '../../components/public/ShopHeader';
import HeroSlider from '../../components/public/HeroSlider';
import ProductGrid from '../../components/public/ProductGrid';
import usePublicTheme from '../../hooks/usePublicTheme';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const WhatsAppLogo = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const InstagramLogo = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

// ─── Shop Footer ──────────────────────────────────────────────────────────────
const ShopFooter = ({ tenant, labels, slug }) => {
  const config = tenant?.websiteConfig || {};
  const hasContact = config.whatsapp || config.instagram;

  return (
    <footer
      className="mt-16 border-t"
      style={{ borderColor: 'color-mix(in srgb, var(--tenant-text, #1c1917) 10%, transparent)' }}
    >
      <div className="max-w-6xl mx-auto px-4 py-14">
        <div className="flex flex-col items-center text-center gap-6">

          {/* Logo */}
          {config.logo && (
            <img
              src={config.logo}
              alt={tenant?.businessName}
              className="w-24 h-24 rounded-2xl object-contain border shadow-sm"
              style={{ borderColor: 'color-mix(in srgb, var(--tenant-text, #1c1917) 10%, transparent)' }}
            />
          )}

          {/* Business name + address */}
          <div>
            <h3
              className="text-3xl sm:text-4xl font-bold"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: 'var(--tenant-text, #1c1917)',
              }}
            >
              {tenant?.businessName}
            </h3>
            {config.address && (
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <MapPin
                  size={13}
                  className="flex-shrink-0"
                  style={{ color: 'color-mix(in srgb, var(--tenant-text, #1c1917) 40%, transparent)' }}
                />
                <span
                  className="text-sm"
                  style={{ color: 'color-mix(in srgb, var(--tenant-text, #1c1917) 50%, transparent)' }}
                >
                  {config.address}
                </span>
              </div>
            )}
          </div>

          {/* Contact buttons */}
          {hasContact && (
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {config.whatsapp && (
                <a
                  href={`https://wa.me/${config.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90 shadow-sm"
                  style={{ background: '#25D366' }}
                >
                  <WhatsAppLogo size={16} />
                  Chat on WhatsApp
                </a>
              )}
              {config.instagram && (
                <a
                  href={`https://instagram.com/${config.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90 shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}
                >
                  <InstagramLogo size={16} />
                  Follow on Instagram
                </a>
              )}
            </div>
          )}

          {/* Nav links */}
          <div className="flex items-center gap-5 flex-wrap justify-center">
            <Link
              to={`/s/${slug}`}
              className="text-sm font-medium transition-colors hover:opacity-100"
              style={{ color: 'color-mix(in srgb, var(--tenant-text, #1c1917) 45%, transparent)' }}
            >
              Home
            </Link>
            <Link
              to={`/s/${slug}/shop`}
              className="text-sm font-medium transition-colors hover:opacity-100"
              style={{ color: 'color-mix(in srgb, var(--tenant-text, #1c1917) 45%, transparent)' }}
            >
              {labels?.shop || 'Shop'}
            </Link>
          </div>

          {/* Divider + powered by */}
          <div
            className="w-full border-t pt-6 mt-1"
            style={{ borderColor: 'color-mix(in srgb, var(--tenant-text, #1c1917) 8%, transparent)' }}
          >
            <div
              className="flex flex-col items-center gap-1"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: 'color-mix(in srgb, var(--tenant-text, #1c1917) 25%, transparent)',
              }}
            >
              <span className="text-sm font-medium">Powered by ArtSpace</span>
              <a
                href="mailto:er.cs.krushnasoni@gmail.com"
                title="Contact developer"
                className="inline-flex items-center gap-1 text-xs hover:opacity-70 transition-opacity"
              >
                <Mail className="w-3 h-3" />
                Built by Krushna Soni
              </a>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

// ─── FAQ Section ──────────────────────────────────────────────────────────────
const FAQSection = ({ slug, faqEnabled }) => {
  const [faqs,   setFaqs]   = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    if (!faqEnabled || !slug) return;
    fetch(`${API_BASE}/public/${slug}/faq`)
      .then((r) => r.json())
      .then((json) => { if (json.success) setFaqs(json.data); })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [slug, faqEnabled]);

  if (!faqEnabled || (loaded && faqs.length === 0)) return null;

  return (
    <section className="py-14">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8 text-center">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-1"
            style={{ color: 'var(--tenant-primary)' }}
          >
            FAQ
          </p>
          <h2
            className="text-2xl sm:text-3xl font-bold"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: 'var(--tenant-text, #1c1917)',
            }}
          >
            Frequently Asked Questions
          </h2>
        </div>
        {!loaded ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 rounded-xl animate-pulse"
                style={{ background: 'color-mix(in srgb, var(--tenant-text, #1c1917) 7%, transparent)' }}
              />
            ))}
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {faqs.map((faq) => {
                const isOpen = openId === faq._id;
                return (
                  <div
                    key={faq._id}
                    className="border rounded-xl overflow-hidden transition-all duration-200"
                    style={{
                      borderColor: isOpen
                        ? 'color-mix(in srgb, var(--tenant-primary) 30%, transparent)'
                        : 'color-mix(in srgb, var(--tenant-text, #1c1917) 10%, transparent)',
                      background: isOpen
                        ? 'color-mix(in srgb, var(--tenant-primary) 4%, var(--tenant-bg))'
                        : 'transparent',
                    }}
                  >
                    <button
                      onClick={() => setOpenId(isOpen ? null : faq._id)}
                      className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
                    >
                      <span
                        className="text-sm sm:text-base font-semibold leading-snug"
                        style={{ color: 'var(--tenant-text, #1c1917)' }}
                      >
                        {faq.question}
                      </span>
                      <span className="flex-shrink-0" style={{ color: 'var(--tenant-primary)' }}>
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5">
                        <p
                          className="text-sm leading-relaxed whitespace-pre-wrap"
                          style={{ color: 'color-mix(in srgb, var(--tenant-text, #1c1917) 65%, transparent)' }}
                        >
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-8 text-center">
              <Link
                to={`/s/${slug}/faq`}
                className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70"
                style={{ color: 'var(--tenant-primary)' }}
              >
                View all FAQs
                <ArrowRight size={14} />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

// ─── Home Page ────────────────────────────────────────────────────────────────
const HomePage = () => {
  const { slug } = useParams();
  const { tenant, labels } = useTenant();
  const [products, setProducts] = useState([]);
  const [sliders, setSliders] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const navigate = useNavigate();
  const config = tenant?.websiteConfig || {};
    const themeClass = usePublicTheme();

  useEffect(() => {
    if (!slug) return;
    const loadData = async () => {
      try {
        const [prodRes, sliderRes] = await Promise.all([
          fetch(`${API_BASE}/public/${slug}/products`),
          fetch(`${API_BASE}/public/${slug}/sliders`),
        ]);
        const [prodJson, sliderJson] = await Promise.all([prodRes.json(), sliderRes.json()]);
        if (prodJson.success) setProducts(prodJson.data);
        if (sliderJson.success) setSliders(sliderJson.data);
      } catch (err) {
        console.error('Failed to load shop data:', err);
      } finally {
        setLoadingProducts(false);
      }
    };
    loadData();
  }, [slug]);

  const handleSlideClick = (slide) => {
    if (slide.linkType === 'product' && slide.linkId) {
      navigate(`/s/${slug}/shop?product=${slide.linkId}`);
    } else if (slide.linkType === 'category' && slide.linkId) {
      const valueParam = slide.linkValue ? `&value=${encodeURIComponent(slide.linkValue)}` : '';
      navigate(`/s/${slug}/shop?category=${slide.linkId}${valueParam}`);
    }
  };

  const showViewAll = products.length > 8;

 return (
    <div className={`min-h-screen ${themeClass}`} style={{ background: 'var(--tenant-bg)' }}>
      <ShopHeader />

      {/* Hero slider */}
      {config.sliderEnabled && sliders.length > 0 && (
        <HeroSlider slides={sliders} onSlideClick={handleSlideClick} />
      )}

      {/* Products section */}
      <section
        className="py-12"
        style={{
          background: showViewAll
            ? 'color-mix(in srgb, var(--tenant-primary) 3%, var(--tenant-bg))'
            : 'var(--tenant-bg)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4">

          {/* Section header */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <p
                className="text-xs font-bold uppercase tracking-widest mb-1"
                style={{ color: 'var(--tenant-primary)' }}
              >
                Collection
              </p>
              <h2
                className="text-2xl sm:text-3xl font-bold leading-tight"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: 'var(--tenant-text, #1c1917)',
                }}
              >
                {labels.products || 'Our Products'}
              </h2>
            </div>
            {showViewAll && (
              <Link
                to={`/s/${slug}/shop`}
                className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold text-white transition-opacity hover:opacity-90 shadow-sm"
                style={{ background: 'var(--tenant-primary)' }}
              >
                View All <ArrowRight size={15} />
              </Link>
            )}
          </div>

          {/* Loading skeletons */}
          {loadingProducts ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl animate-pulse aspect-square"
                  style={{ background: 'color-mix(in srgb, var(--tenant-text, #1c1917) 7%, transparent)' }}
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'color-mix(in srgb, var(--tenant-primary) 10%, transparent)' }}
              >
                <ShoppingBag size={28} style={{ color: 'var(--tenant-primary)' }} />
              </div>
              <p
                className="text-base font-semibold mb-1"
                style={{ color: 'var(--tenant-text, #1c1917)' }}
              >
                No products yet
              </p>
              <p
                className="text-sm"
                style={{ color: 'color-mix(in srgb, var(--tenant-text, #1c1917) 45%, transparent)' }}
              >
                Check back soon!
              </p>
            </div>
          ) : (
            <ProductGrid products={products} limit={8} />
          )}

          {/* Mobile "View All" button — shown below grid */}
          {showViewAll && !loadingProducts && (
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to={`/s/${slug}/shop`}
                className="sm:hidden inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-white text-sm font-semibold transition-opacity hover:opacity-90 shadow-sm"
                style={{ background: 'var(--tenant-primary)' }}
              >
                View All {labels.products || 'Products'}
                <ArrowRight size={16} />
              </Link>
              {/* Desktop second CTA below grid — only if many products */}
              <Link
                to={`/s/${slug}/shop`}
                className="hidden sm:inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-white text-sm font-semibold transition-opacity hover:opacity-90 shadow-sm"
                style={{ background: 'var(--tenant-primary)' }}
              >
                View All {labels.products || 'Products'}
                <ArrowRight size={16} />
              </Link>
            </div>
          )}

        </div>
      </section>

    {/* DEBUG - remove after fix */}
<div style={{background:'red',color:'white',padding:8}}>
  faqEnabled: {String(tenant?.faqEnabled)} | config.faqEnabled: {String(config.faqEnabled)}
</div>

      <FAQSection slug={slug} faqEnabled={config.faqEnabled} />

      <ShopFooter tenant={tenant} labels={labels} slug={slug} />
    </div>
  );
};

export default HomePage;