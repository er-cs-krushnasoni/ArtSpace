import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight, Clock } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import ShopHeader from '../../components/public/ShopHeader';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

const formatDateShort = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

export default function BlogIndexPage() {
  const { tenant } = useTenant();
  const navigate   = useNavigate();
  const slug       = tenant?.slug;
  const config     = tenant?.websiteConfig || {};

  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!config.blogEnabled) {
      navigate(`/s/${slug}`, { replace: true });
      return;
    }
    const load = async () => {
      try {
        const res  = await fetch(`${API_BASE}/public/${slug}/blog`);
        const json = await res.json();
        setPosts(json.data || []);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    load();
  }, [slug, config.blogEnabled]);

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--tenant-bg)' }}>
        <ShopHeader />
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div
            className="h-8 rounded-xl w-40 mb-10 animate-pulse"
            style={{ background: 'color-mix(in srgb, var(--tenant-nav-text, #1c1917) 8%, transparent)' }}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-52 rounded-2xl animate-pulse"
                style={{ background: 'color-mix(in srgb, var(--tenant-nav-text, #1c1917) 6%, transparent)' }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--tenant-bg)' }}>
      <ShopHeader />

      <div className="max-w-3xl mx-auto px-4 py-12">

        {/* Heading */}
        <div className="mb-10">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-1"
            style={{ color: 'var(--tenant-primary)' }}
          >
            Journal
          </p>
          <h1
            className="text-2xl sm:text-3xl font-bold"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: 'var(--tenant-nav-text, #1c1917)',
            }}
          >
            Blog
          </h1>
          <p
            className="text-sm mt-1.5"
            style={{ color: 'color-mix(in srgb, var(--tenant-nav-text, #1c1917) 50%, transparent)' }}
          >
            Stories, tips &amp; updates from {tenant?.businessName}
          </p>
        </div>

        {/* Empty state */}
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'color-mix(in srgb, var(--tenant-primary) 10%, transparent)' }}
            >
              <FileText size={24} style={{ color: 'var(--tenant-primary)' }} />
            </div>
            <p
              className="text-base font-semibold mb-1"
              style={{ color: 'var(--tenant-nav-text, #1c1917)' }}
            >
              No posts yet
            </p>
            <p
              className="text-sm"
              style={{ color: 'color-mix(in srgb, var(--tenant-nav-text, #1c1917) 45%, transparent)' }}
            >
              Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {posts.map((post, i) => (
              <article
                key={post._id}
                onClick={() => navigate(`/s/${slug}/blog/${post.slug}`)}
                className="group rounded-2xl cursor-pointer hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 flex flex-col overflow-hidden"
                style={{
                  background: 'var(--tenant-card-bg, #ffffff)',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  animation: 'blogCardIn 0.35s ease both',
                  animationDelay: `${i * 60}ms`,
                }}
              >
                {/* Cover image if present */}
                {post.coverImage && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                <div className="p-5 flex flex-col flex-1">
                  {/* Date + read time */}
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="text-xs font-bold"
                      style={{ color: 'var(--tenant-primary)' }}
                    >
                      {formatDate(post.publishDate)}
                    </span>
                  </div>

                  {/* Title */}
                  <h2
                    className="text-base font-bold mb-2 leading-snug flex-1"
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      color: 'var(--tenant-nav-text, #1c1917)',
                    }}
                  >
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p
                      className="text-sm leading-relaxed line-clamp-2 mb-4"
                      style={{ color: 'color-mix(in srgb, var(--tenant-nav-text, #1c1917) 55%, transparent)' }}
                    >
                      {post.excerpt}
                    </p>
                  )}

                  {/* Read more */}
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-bold mt-auto group-hover:gap-2.5 transition-all duration-150"
                    style={{ color: 'var(--tenant-primary)' }}
                  >
                    Read more <ArrowRight size={12} />
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes blogCardIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}