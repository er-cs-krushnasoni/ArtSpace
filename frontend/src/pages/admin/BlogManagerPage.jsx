import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  PenSquare, Trash2, Plus, FileText, Globe,
  EyeOff, ToggleLeft, ToggleRight, AlertCircle,
} from 'lucide-react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const StatusBadge = ({ isPublished }) =>
  isPublished ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
      <Globe size={10} /> Published
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
      <EyeOff size={10} /> Draft
    </span>
  );

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export default function BlogManagerPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [blogEnabled, setBlogEnabled] = useState(false);
  const [toggling, setToggling]       = useState(false);
  const [deletingId, setDeletingId]   = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [postsRes, settingsRes] = await Promise.all([
        api.get('/tenant/blog'),
        api.get('/tenant/settings'),
      ]);
      setPosts(postsRes.data.data || []);
      setBlogEnabled(settingsRes.data.data?.websiteConfig?.blogEnabled ?? false);
    } catch {
      toast.error('Failed to load blog data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlog = async () => {
    setToggling(true);
    try {
      const newVal = !blogEnabled;
      await api.put('/tenant/settings/toggles', { blogEnabled: newVal });
      setBlogEnabled(newVal);
      toast.success(`Blog ${newVal ? 'enabled' : 'disabled'}`);
    } catch {
      toast.error('Failed to update setting');
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async (postId, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(postId);
    try {
      await api.delete(`/tenant/blog/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      toast.success('Post deleted');
    } catch {
      toast.error('Failed to delete post');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <div className="h-8 bg-gray-100 rounded w-48 mb-6 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Blog</h1>
          <p className="text-sm text-gray-500 mt-0.5">Write and publish posts for your customers</p>
        </div>

        {/* Actions row — wraps neatly on mobile */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleToggleBlog}
            disabled={toggling}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {blogEnabled
              ? <ToggleRight size={18} className="text-violet-600" />
              : <ToggleLeft  size={18} className="text-gray-400" />}
            {blogEnabled ? 'Blog enabled' : 'Blog disabled'}
          </button>

          <button
            onClick={() => navigate(`/s/${slug}/admin/dashboard/blog/new`)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 transition-colors whitespace-nowrap"
          >
            <Plus size={16} /> New Post
          </button>
        </div>
      </div>

      {/* Blog disabled warning */}
      {!blogEnabled && (
        <div className="mb-5 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
          <AlertCircle size={16} className="flex-shrink-0 text-amber-500 mt-0.5" />
          <span>Blog is disabled — posts won't appear on your public site until you enable it.</span>
        </div>
      )}

      {/* Post list */}
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-gray-100 shadow-sm px-4">
          <FileText className="w-10 h-10 text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-500">No posts yet</p>
          <p className="text-xs text-gray-400 mt-1 mb-5">Create your first blog post to engage your customers</p>
          <button
            onClick={() => navigate(`/s/${slug}/admin/dashboard/blog/new`)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 transition-colors"
          >
            <Plus size={14} /> Write first post
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {posts.map((post) => (
            <div
              key={post._id}
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-5 hover:bg-gray-50 transition-colors"
            >
              {/* Title + meta */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{post.title}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <StatusBadge isPublished={post.isPublished} />
                  <span className="text-xs text-gray-400">{formatDate(post.publishDate)}</span>
                  {/* Slug hidden on very small screens to save space */}
                  <span className="hidden xs:inline text-xs text-gray-300 truncate max-w-[140px]">
                    /{post.seo?.slug}
                  </span>
                </div>
              </div>

              {/* Action buttons — full-width on mobile, auto on sm+ */}
              <div className="flex items-center gap-2 sm:flex-shrink-0">
                <button
                  onClick={() => navigate(`/s/${slug}/admin/dashboard/blog/edit/${post._id}`)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-violet-600 bg-violet-50 hover:bg-violet-100 transition-colors"
                >
                  <PenSquare size={13} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(post._id, post.title)}
                  disabled={deletingId === post._id}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={13} /> {deletingId === post._id ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}