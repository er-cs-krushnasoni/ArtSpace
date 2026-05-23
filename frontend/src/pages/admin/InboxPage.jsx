import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Inbox, Plus, Clock } from 'lucide-react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import QueryCard from '../../components/admin/inbox/QueryCard';
import ConfirmOrderModal from '../../components/admin/inbox/ConfirmOrderModal';
import ManualQueryModal from '../../components/admin/inbox/ManualQueryModal';

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

const EmptyState = ({ tab }) => {
  const messages = {
    all:          ['No queries yet', 'Customer orders will appear here'],
    unread:       ['No unread queries', 'New orders will appear here'],
    reply_later:  ['Nothing in Reply Later', 'Mark queries for follow-up'],
    seen:         ['No seen queries', 'Queries marked as seen appear here for 24 hours'],
  };
  const [title, sub] = messages[tab] || messages.all;
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Inbox className="w-10 h-10 text-gray-300 mb-3" />
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
};

const TABS = [
  { key: 'all',         label: 'All' },
  { key: 'unread',      label: 'Unread' },
  { key: 'reply_later', label: 'Reply Later' },
  { key: 'seen',        label: 'Seen' },
];

// Time remaining until 24hr deletion
const getTimeRemaining = (seenAt) => {
  if (!seenAt) return null;
  const deleteAt = new Date(seenAt).getTime() + 24 * 60 * 60 * 1000;
  const remaining = deleteAt - Date.now();
  if (remaining <= 0) return 'Deleting soon';
  const h = Math.floor(remaining / (1000 * 60 * 60));
  const m = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  if (h > 0) return `${h}h ${m}m left`;
  return `${m}m left`;
};

export default function InboxPage() {
  const { slug } = useParams();
  const [queries,       setQueries]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [activeTab,     setActiveTab]     = useState('all');
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [manualOpen,    setManualOpen]    = useState(false);

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

  useEffect(() => { fetchInbox(); }, [fetchInbox]);

  const removeQuery = (id) => setQueries((prev) => prev.filter((q) => q._id !== id));
  const updateQuery = (id, updates) =>
    setQueries((prev) => prev.map((q) => (q._id === id ? { ...q, ...updates } : q)));

  const handleMarkSeen = async (queryId) => {
    try {
      await api.patch(`/tenant/inbox/${queryId}/seen`);
      updateQuery(queryId, { status: 'seen', seenAt: new Date().toISOString() });
      toast.success('Marked as seen — 24hr timer started');
    } catch {
      toast.error('Failed to update query');
    }
  };

  const handleReplyLater = async (queryId) => {
    try {
      await api.patch(`/tenant/inbox/${queryId}/reply-later`);
      updateQuery(queryId, { status: 'reply_later', seenAt: null });
      toast.success('Moved to Reply Later');
    } catch {
      toast.error('Failed to update query');
    }
  };

  const handleMarkUnread = async (queryId) => {
    try {
      await api.patch(`/tenant/inbox/${queryId}/unread`);
      updateQuery(queryId, { status: 'unread', seenAt: null });
      toast.success('Moved back to Unread');
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

  const filtered =
    activeTab === 'all'
      ? queries
      : queries.filter((q) => q.status === activeTab);

  const unreadCount     = queries.filter((q) => q.status === 'unread').length;
  const replyLaterCount = queries.filter((q) => q.status === 'reply_later').length;
  const seenCount       = queries.filter((q) => q.status === 'seen').length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Query Inbox</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {unreadCount} unread · {replyLaterCount} reply later · {seenCount} seen
          </p>
        </div>
        <button
          onClick={() => setManualOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-200 hover:opacity-90"
          style={{ background: 'var(--color-primary)' }}
        >
          <Plus className="w-4 h-4" />New Query
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-lg w-fit">
        {TABS.map(({ key, label }) => {
          const count = key === 'unread' ? unreadCount : key === 'reply_later' ? replyLaterCount : key === 'seen' ? seenCount : null;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
              {count > 0 && (
                <span className={`ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-semibold text-white ${
                  key === 'seen' ? 'bg-amber-400' : 'bg-violet-500'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Seen tab notice */}
      {activeTab === 'seen' && seenCount > 0 && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-700">
          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
          Seen queries are automatically deleted 24 hours after being marked as seen. Retrieve them before they disappear.
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-4"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
      ) : filtered.length === 0 ? (
        <EmptyState tab={activeTab} />
      ) : (
        <div className="space-y-4">
          {filtered.map((query) => (
            <div key={query._id}>
              {/* 24hr timer for seen queries */}
              {query.status === 'seen' && query.seenAt && (
                <div className="flex items-center gap-1 mb-1 text-xs text-amber-600">
                  <Clock className="w-3 h-3" />
                  {getTimeRemaining(query.seenAt)}
                </div>
              )}
              <QueryCard
                query={query}
                onMarkSeen={handleMarkSeen}
                onReplyLater={handleReplyLater}
                onMarkUnread={handleMarkUnread}
                onDelete={handleDelete}
                onConfirm={() => setConfirmTarget(query)}
              />
            </div>
          ))}
        </div>
      )}

      {confirmTarget && (
        <ConfirmOrderModal
          query={confirmTarget}
          onClose={() => setConfirmTarget(null)}
          onConfirmed={handleConfirmDone}
        />
      )}

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