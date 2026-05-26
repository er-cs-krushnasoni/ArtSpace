import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import ShopHeader from '../../components/public/ShopHeader';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

export default function BlogIndexPage() {
  const { tenant } = useTenant();
  const navigate = useNavigate();
  const slug = tenant?.slug;
  const config = tenant?.websiteConfig || {};
  const primaryColor = config.primaryColor || '#8b5cf6';

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!config.blogEnabled) { navigate(`/s/${slug}`, { replace: true }); return; }
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/public/${slug}/blog`);
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
        <div className="max-w-3xl mx-auto px-4 py-10">
          <div className="h-8 bg-gray-100 rounded w-40 mb-8 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-44 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
<div className="min-h-screen" style={{ background: 'var(--tenant-bg)' }}>
      <ShopHeader />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1
            className="text-2xl font-semibold text-gray-900"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Blog
          </h1>
          <p className="text-sm text-gray-500 mt-1">Stories, tips & updates from {tenant?.businessName}</p>
        </div>

        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FileText className="w-10 h-10 text-gray-200 mb-3" />
            <p className="text-sm text-gray-400">No posts yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {posts.map((post) => (
              <article
                key={post._id}
                onClick={() => navigate(`/s/${slug}/blog/${post.slug}`)}
                className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
              >
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--tenant-primary)' }}>
                  {formatDate(post.publishDate)}
                </p>
                <h2
                  className="text-base font-semibold text-gray-900 mb-2 leading-snug flex-1"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-3">{post.excerpt}</p>
                )}
                <span
                  className="inline-flex items-center gap-1 text-xs font-semibold mt-auto"
                  style={{ color: 'var(--tenant-primary)' }}
                >
                  Read more <ArrowRight size={12} />
                </span>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}