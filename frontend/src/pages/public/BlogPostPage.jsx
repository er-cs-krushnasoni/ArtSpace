import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useTenant } from '../../context/TenantContext';
import ShopHeader from '../../components/public/ShopHeader';
import { generateHTML } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TiptapLinkExtension from '@tiptap/extension-link';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

const tiptapToHTML = (content) => {
  try {
    const json = typeof content === 'string' ? JSON.parse(content) : content;
    return generateHTML(json, [
      StarterKit,
      Underline,
      TiptapLinkExtension.configure({ HTMLAttributes: { class: 'text-violet-600 underline' } }),
    ]);
  } catch {
    return `<p>${content}</p>`;
  }
};

export default function BlogPostPage() {
  const { slug, postSlug } = useParams();
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const config = tenant?.websiteConfig || {};

  const [post, setPost]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!config.blogEnabled) { navigate(`/s/${slug}`, { replace: true }); return; }
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/public/${slug}/blog/${postSlug}`);
        if (!res.ok) { setNotFound(true); return; }
        const json = await res.json();
        setPost(json.data);
      } catch { setNotFound(true); }
      finally { setLoading(false); }
    };
    load();
  }, [slug, postSlug, config.blogEnabled]);

  if (loading) {
    return (
<div className="min-h-screen" style={{ background: 'var(--tenant-bg)' }}>
        <ShopHeader />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="h-7 bg-gray-100 rounded w-3/4 mb-4 animate-pulse" />
          <div className="h-4 bg-gray-100 rounded w-1/3 mb-8 animate-pulse" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-4 bg-gray-100 rounded mb-3 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
<div className="min-h-screen" style={{ background: 'var(--tenant-bg)' }}>
        <ShopHeader />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Post not found</h2>
          <p className="text-sm text-gray-400 mb-6">
            This post may have been removed or the link is incorrect.
          </p>
          <Link
            to={`/s/${slug}/blog`}
            className="inline-flex items-center gap-2 text-sm font-medium text-violet-600 hover:text-violet-700"
          >
            <ArrowLeft size={14} /> Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const html       = tiptapToHTML(post.content);
  const metaTitle  = post.seo?.metaTitle || post.title;
  const metaDesc   = post.seo?.metaDescription || '';

  return (
<div className="min-h-screen" style={{ background: 'var(--tenant-bg)' }}>
      <Helmet>
        <title>{metaTitle} — {tenant?.businessName}</title>
        {metaDesc && <meta name="description" content={metaDesc} />}
        <meta property="og:title" content={metaTitle} />
        {metaDesc && <meta property="og:description" content={metaDesc} />}
      </Helmet>

      <ShopHeader />

      <article className="max-w-2xl mx-auto px-4 py-12">
        {/* Back link */}
        <Link
          to={`/s/${slug}/blog`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-8 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Blog
        </Link>

        {/* Header */}
        <header className="mb-8">
          <p className="text-sm text-gray-400 mb-3">{formatDate(post.publishDate)}</p>
          <h1
            className="text-2xl sm:text-3xl font-semibold text-gray-900 leading-snug"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {post.title}
          </h1>
        </header>

        {/* Content */}
        <div
          className="prose prose-sm prose-gray max-w-none"
          style={{ lineHeight: '1.8' }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>
    </div>
  );
}