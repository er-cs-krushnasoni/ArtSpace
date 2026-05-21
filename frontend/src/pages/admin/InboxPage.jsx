import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Inbox, Plus } from 'lucide-react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import QueryCard from '../../components/admin/inbox/QueryCard';
import ConfirmOrderModal from '../../components/admin/inbox/ConfirmOrderModal';
import ManualQueryModal from '../../components/admin/inbox/ManualQueryModal';

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const CardSkeleton = () => (
  <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-4 animate-pulse">
    <div className="flex items-center justify-between mb-3">
      <div className="flex gap-2">
        <div className="h-5 w-20 bg-gray-200 rounded-full" />
        <div className="h-5 w-24 bg-gray-100 rounded-full" />
      </div>
      <div className="h-4 w-16 bg-gray-100 rounded" />
    </div>
    <div className="h-4 w-40 bg-gray-200 rounded mb-2" />
    <div className="h-3 w-64 bg-gray-100 rounded mb-4" />
    <div className="flex gap-2">
      <div className="h-8 w-16 bg-gray-100 rounded-lg" />
      <div className="h-8 w-16 bg-gray-100 rounded-lg" />
      <div className="h-8 w-24 bg-gray-100 rounded-lg" />
    </div>
  </div>
);

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = ({ filtered }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <Inbox className="w-10 h-10 text-gray-300 mb-3" />
    <p className="text-sm font-medium text-gray-500">
      {filtered ? 'No queries in this filter' : 'No queries yet'}
    </p>
    <p className="text-xs text-gray-400 mt-1">
      {filtered ? 'Try a different tab' : 'Customer orders will appear here'}
    </p>
  </div>
);

// ─── Filter tabs ──────────────────────────────────────────────────────────────
const TABS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'reply_later', label: 'Reply Later' },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function InboxPage() {
  const { slug } = useParams();
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [confirmTarget, setConfirmTarget] = useState(null); // query to confirm
  const [manualOpen, setManualOpen] = useState(false);

  const fetchInbox = useCallback(async () => {
    try {
      const res = await api.get('/tenant/inbox');
      setQueries(res.data.data || []);
    } catch {
      toast.error('Failed to load inbox');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInbox();
  }, [fetchInbox]);

  const removeQuery = (queryId) =>
    setQueries((prev) => prev.filter((q) => q._id !== queryId));

  const updateQuery = (queryId, updates) =>
    setQueries((prev) =>
      prev.map((q) => (q._id === queryId ? { ...q, ...updates } : q))
    );

  // ── Actions ──────────────────────────────────────────────────────────────────

  const handleMarkSeen = async (queryId) => {
    try {
      await api.patch(`/tenant/inbox/${queryId}/seen`);
      removeQuery(queryId);
      toast.success('Marked as seen — 24hr timer started');
    } catch {
      toast.error('Failed to update query');
    }
  };

  const handleReplyLater = async (queryId) => {
    try {
      await api.patch(`/tenant/inbox/${queryId}/reply-later`);
      updateQuery(queryId, { status: 'reply_later' });
      toast.success('Moved to Reply Later');
    } catch {
      toast.error('Failed to update query');
    }
  };

  const handleDelete = async (queryId) => {
    try {
      await api.delete(`/tenant/inbox/${queryId}`);
      removeQuery(queryId);
      toast.success('Query deleted');
    } catch {
      toast.error('Failed to delete query');
    }
  };

  const handleConfirmDone = (queryId) => {
    removeQuery(queryId);
    setConfirmTarget(null);
  };

  const handleManualCreated = () => {
    setManualOpen(false);
    fetchInbox();
    toast.success('Query created');
  };

  // ── Filtered list ────────────────────────────────────────────────────────────

  const filtered =
    activeTab === 'all'
      ? queries
      : queries.filter((q) => q.status === activeTab);

  const unreadCount = queries.filter((q) => q.status === 'unread').length;
  const replyLaterCount = queries.filter((q) => q.status === 'reply_later').length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Query Inbox</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {unreadCount} unread · {replyLaterCount} reply later
          </p>
        </div>
        <button
          onClick={() => setManualOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-200 hover:opacity-90"
          style={{ background: 'var(--color-primary)' }}
        >
          <Plus className="w-4 h-4" />
          New Query
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-lg w-fit">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
            {key === 'unread' && unreadCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-semibold text-white bg-violet-500">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState filtered={activeTab !== 'all'} />
      ) : (
        <div className="space-y-4">
          {filtered.map((query) => (
            <QueryCard
              key={query._id}
              query={query}
              onMarkSeen={handleMarkSeen}
              onReplyLater={handleReplyLater}
              onDelete={handleDelete}
              onConfirm={() => setConfirmTarget(query)}
            />
          ))}
        </div>
      )}

      {/* Confirm Order Modal */}
      {confirmTarget && (
        <ConfirmOrderModal
          query={confirmTarget}
          onClose={() => setConfirmTarget(null)}
          onConfirmed={handleConfirmDone}
        />
      )}

      {/* Manual Query Modal */}
      {manualOpen && (
        <ManualQueryModal
          slug={slug}
          onClose={() => setManualOpen(false)}
          onCreated={handleManualCreated}
        />
      )}
    </div>
  );
}