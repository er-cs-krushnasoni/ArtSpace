import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import TiptapEditor from '../../components/admin/blog/TiptapEditor';

const generateSlug = (title) =>
  title.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);

export default function PostEditorPage() {
  const { slug, postId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(postId);

  const [form, setForm] = useState({
    title: '',
    content: '',
    isPublished: false,
    publishDate: new Date().toISOString().slice(0, 10),
    seo: { metaTitle: '', metaDescription: '', slug: '' },
  });
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [seoOpen, setSeoOpen]   = useState(false);
  const [loading, setLoading]   = useState(isEdit);
  const [saving, setSaving]     = useState(false);

  // Fetch existing post for edit
  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      try {
        const res = await api.get('/tenant/blog');
        const post = (res.data.data || []).find((p) => p._id === postId);
        if (!post) { toast.error('Post not found'); navigate(`/s/${slug}/admin/dashboard/blog`); return; }
        // Fetch full post content
        const fullRes = await api.get(`/tenant/blog/${postId}`);
        const full = fullRes.data.data;
        setForm({
          title: full.title || '',
          content: full.content || '',
          isPublished: full.isPublished ?? false,
          publishDate: full.publishDate ? full.publishDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
          seo: {
            metaTitle: full.seo?.metaTitle || '',
            metaDescription: full.seo?.metaDescription || '',
            slug: full.seo?.slug || '',
          },
        });
        setSlugManuallyEdited(true); // don't auto-regenerate slug for existing posts
      } catch {
        toast.error('Failed to load post');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isEdit, postId]);

  // Auto-generate slug from title (only for new posts)
  const handleTitleChange = (val) => {
    setForm((f) => ({
      ...f,
      title: val,
      seo: {
        ...f.seo,
        slug: slugManuallyEdited ? f.seo.slug : generateSlug(val),
        metaTitle: f.seo.metaTitle || val,
      },
    }));
  };

  const handleSave = async (publishOverride) => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.content || form.content === '{"type":"doc","content":[]}') {
      toast.error('Content is required'); return;
    }
    setSaving(true);
    const payload = {
      ...form,
      isPublished: publishOverride !== undefined ? publishOverride : form.isPublished,
    };
    try {
      if (isEdit) {
        await api.put(`/tenant/blog/${postId}`, payload);
        toast.success('Post updated');
      } else {
        await api.post('/tenant/blog', payload);
        toast.success('Post created');
      }
      navigate(`/s/${slug}/admin/dashboard/blog`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="h-8 bg-gray-100 rounded w-48 mb-8 animate-pulse" />
        {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-gray-100 rounded-xl mb-4 animate-pulse" />)}
        <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate(`/s/${slug}/admin/dashboard/blog`)}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-5 transition-colors"
      >
        <ArrowLeft size={14} /> Back to Blog
      </button>

      <h1 className="text-xl font-semibold text-gray-900 mb-6">
        {isEdit ? 'Edit Post' : 'New Post'}
      </h1>

      <div className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Title <span className="text-red-500">*</span></label>
          <input
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Post title"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Content <span className="text-red-500">*</span></label>
          <TiptapEditor
            value={form.content}
            onChange={(val) => setForm((f) => ({ ...f, content: val }))}
            placeholder="Write your blog post here…"
          />
        </div>

        {/* Date + Published row */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Publish date</label>
            <input
              type="date"
              value={form.publishDate}
              onChange={(e) => setForm((f) => ({ ...f, publishDate: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
            />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <div
                onClick={() => setForm((f) => ({ ...f, isPublished: !f.isPublished }))}
                className={`relative w-10 h-5 rounded-full transition-colors ${form.isPublished ? 'bg-violet-600' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isPublished ? 'translate-x-5' : ''}`} />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {form.isPublished ? 'Published' : 'Draft'}
              </span>
            </label>
          </div>
        </div>

        {/* SEO — collapsible */}
        <div className="bg-gray-50 rounded-xl border border-gray-100">
          <button
            type="button"
            onClick={() => setSeoOpen(!seoOpen)}
            className="flex items-center justify-between w-full px-5 py-4 text-sm font-medium text-gray-700"
          >
            SEO Settings
            {seoOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </button>
          {seoOpen && (
            <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">URL Slug</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 whitespace-nowrap">/blog/</span>
                  <input
                    value={form.seo.slug}
                    onChange={(e) => {
                      setSlugManuallyEdited(true);
                      const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                      setForm((f) => ({ ...f, seo: { ...f.seo, slug: val } }));
                    }}
                    placeholder="post-url-slug"
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Changing this after publishing will break existing links.</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Meta Title</label>
                <input
                  value={form.seo.metaTitle}
                  onChange={(e) => setForm((f) => ({ ...f, seo: { ...f.seo, metaTitle: e.target.value } }))}
                  placeholder="SEO title (defaults to post title)"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Meta Description</label>
                <textarea
                  value={form.seo.metaDescription}
                  onChange={(e) => setForm((f) => ({ ...f, seo: { ...f.seo, metaDescription: e.target.value } }))}
                  placeholder="Brief description for search engines (150–160 chars)"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {saving && !form.isPublished && <Loader2 size={14} className="animate-spin" />}
            Save as Draft
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 transition-colors disabled:opacity-50"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? 'Update Post' : 'Publish Now'}
          </button>
        </div>
      </div>
    </div>
  );
}