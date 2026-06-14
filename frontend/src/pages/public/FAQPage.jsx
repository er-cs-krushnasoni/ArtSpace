// frontend/src/pages/public/FAQPage.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import ShopHeader from '../../components/public/ShopHeader';
import usePublicTheme from '../../hooks/usePublicTheme';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const FAQAccordionItem = ({ faq, isOpen, onToggle }) => (
  <div
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
      onClick={onToggle}
      className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
    >
      <span
        className="text-sm sm:text-base font-semibold leading-snug"
        style={{ color: 'var(--tenant-text, #1c1917)' }}
      >
        {faq.question}
      </span>
      <span className="flex-shrink-0" style={{ color: 'var(--tenant-primary)' }}>
        {isOpen
          ? <ChevronUp className="w-4 h-4" />
          : <ChevronDown className="w-4 h-4" />}
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

export default function FAQPage() {
  const { slug }    = useParams();
  const { tenant }  = useTenant();
  const themeClass  = usePublicTheme();

  const [faqs,    setFaqs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId,  setOpenId]  = useState(null);

  useEffect(() => {
    if (!slug) return;
    fetch(`${API_BASE}/public/${slug}/faq`)
      .then((r) => r.json())
      .then((json) => { if (json.success) setFaqs(json.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (tenant?.businessName) {
      document.title = `FAQ — ${tenant.businessName}`;
    }
  }, [tenant]);

  return (
    <div className={`min-h-screen ${themeClass}`} style={{ background: 'var(--tenant-bg)' }}>
      <ShopHeader />

      <div className="max-w-2xl mx-auto px-4 py-14">
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'color-mix(in srgb, var(--tenant-primary) 12%, transparent)' }}
          >
            <HelpCircle className="w-5 h-5" style={{ color: 'var(--tenant-primary)' }} />
          </div>
          <div>
            <h1
              className="text-2xl sm:text-3xl font-bold"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: 'var(--tenant-text, #1c1917)',
              }}
            >
              Frequently Asked Questions
            </h1>
            {tenant?.businessName && (
              <p
                className="text-sm mt-0.5"
                style={{ color: 'color-mix(in srgb, var(--tenant-text, #1c1917) 45%, transparent)' }}
              >
                {tenant.businessName}
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-14 rounded-xl animate-pulse"
                style={{ background: 'color-mix(in srgb, var(--tenant-text, #1c1917) 7%, transparent)' }}
              />
            ))}
          </div>
        ) : faqs.length === 0 ? (
          <div className="text-center py-16">
            <HelpCircle
              className="w-10 h-10 mx-auto mb-3"
              style={{ color: 'color-mix(in srgb, var(--tenant-text, #1c1917) 20%, transparent)' }}
            />
            <p
              className="text-sm font-medium"
              style={{ color: 'color-mix(in srgb, var(--tenant-text, #1c1917) 45%, transparent)' }}
            >
              No FAQs available yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {faqs.map((faq) => (
              <FAQAccordionItem
                key={faq._id}
                faq={faq}
                isOpen={openId === faq._id}
                onToggle={() => setOpenId(openId === faq._id ? null : faq._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}