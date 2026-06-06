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
  const navigate           = useNavigate();
  const { tenant }         = useTenant();
  const config             = tenant?.websiteConfig || {};

  const [post,     setPost]     = useState(null);
  const [loading,  setLoading]  = useState(true);
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
        <div className="max-w-2xl mx-auto px-4 py-14">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="h-4 rounded-lg mb-4 animate-pulse"
              style={{
                background: 'color-mix(in srgb, var(--tenant-nav-text, #1c1917) 7%, transparent)',
                width: i === 0 ? '40%' : i === 1 ? '70%' : `${90 - i * 4}%`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--tenant-bg)' }}>
        <ShopHeader />
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <AlertCircle
            className="w-10 h-10 mx-auto mb-3"
            style={{ color: 'color-mix(in srgb, var(--tenant-nav-text, #1c1917) 25%, transparent)' }}
          />
          <h2
            className="text-lg font-bold mb-2"
            style={{ color: 'var(--tenant-nav-text, #1c1917)' }}
          >
            Post not found
          </h2>
          <p
            className="text-sm mb-7"
            style={{ color: 'color-mix(in srgb, var(--tenant-nav-text, #1c1917) 50%, transparent)' }}
          >
            This post may have been removed or the link is incorrect.
          </p>
          <Link
            to={`/s/${slug}/blog`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--tenant-primary)' }}
          >
            <ArrowLeft size={14} /> Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const html      = tiptapToHTML(post.content);
  const metaTitle = post.seo?.metaTitle || post.title;
  const metaDesc  = post.seo?.metaDescription || '';

  return (
    <div className="min-h-screen" style={{ background: 'var(--tenant-bg)' }}>
      <Helmet>
        <title>{metaTitle} — {tenant?.businessName}</title>
        {metaDesc && <meta name="description" content={metaDesc} />}
        <meta property="og:title" content={metaTitle} />
        {metaDesc && <meta property="og:description" content={metaDesc} />}
      </Helmet>

      <ShopHeader />

      <article
        className="max-w-2xl mx-auto px-4 py-12"
        style={{ animation: 'postFadeIn 0.3s ease both' }}
      >
        {/* Back link */}
        <Link
          to={`/s/${slug}/blog`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-medium mb-10 transition-colors"
          style={{
            background: 'color-mix(in srgb, var(--tenant-primary) 10%, transparent)',
            color: 'var(--tenant-primary)',
          }}
        >
          <ArrowLeft size={14} /> Back to Blog
        </Link>

        {/* Cover image */}
        {post.coverImage && (
          <div className="rounded-2xl overflow-hidden mb-10 shadow-sm">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full object-cover max-h-72"
            />
          </div>
        )}

        {/* Header */}
        <header className="mb-10">
          <p
            className="text-sm font-bold mb-3"
            style={{ color: 'var(--tenant-primary)' }}
          >
            {formatDate(post.publishDate)}
          </p>
          <h1
            className="text-2xl sm:text-3xl font-bold leading-snug"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: 'var(--tenant-nav-text, #1c1917)',
            }}
          >
            {post.title}
          </h1>
          {post.excerpt && (
            <p
              className="text-base mt-3 leading-relaxed"
              style={{ color: 'color-mix(in srgb, var(--tenant-nav-text, #1c1917) 60%, transparent)' }}
            >
              {post.excerpt}
            </p>
          )}
        </header>

        {/* Divider */}
        <div
          className="mb-10 h-px"
          style={{ background: 'color-mix(in srgb, var(--tenant-nav-text, #1c1917) 10%, transparent)' }}
        />

        {/* Article content */}
        <div
          className="prose prose-lg max-w-none blog-content"
          style={{
            lineHeight: '1.9',
            color: 'color-mix(in srgb, var(--tenant-nav-text, #1c1917) 80%, transparent)',
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>

      <div className="h-16" />

      <style>{`
        @keyframes postFadeIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .blog-content h1,
        .blog-content h2,
        .blog-content h3 {
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: var(--tenant-nav-text, #1c1917);
          font-weight: 700;
          line-height: 1.3;
          margin-top: 2em;
          margin-bottom: 0.6em;
        }
        .blog-content h1 { font-size: 1.6rem; }
        .blog-content h2 { font-size: 1.3rem; }
        .blog-content h3 { font-size: 1.1rem; }
        .blog-content p  { margin-bottom: 1.4em; }
        .blog-content ul,
        .blog-content ol {
          padding-left: 1.5em;
          margin-bottom: 1.2em;
        }
        .blog-content li { margin-bottom: 0.4em; }
        .blog-content blockquote {
          border-left: 3px solid var(--tenant-primary);
          padding: 0.6em 1.2em;
          margin: 1.5em 0;
          border-radius: 0 12px 12px 0;
          background: color-mix(in srgb, var(--tenant-primary) 6%, transparent);
          font-style: italic;
        }
        .blog-content a {
          color: var(--tenant-primary);
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .blog-content code {
          background: color-mix(in srgb, var(--tenant-nav-text, #1c1917) 8%, transparent);
          padding: 0.15em 0.4em;
          border-radius: 6px;
          font-size: 0.875em;
        }
        .blog-content strong {
          color: var(--tenant-nav-text, #1c1917);
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}