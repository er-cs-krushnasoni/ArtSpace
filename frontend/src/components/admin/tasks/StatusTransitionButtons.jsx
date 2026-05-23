import { useState } from 'react';
import api from '../../../api/axiosInstance';
import toast from 'react-hot-toast';

const STATUSES = [
  { value: 'pending',    label: 'Pending',    color: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
  { value: 'processing', label: 'Processing', color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
  { value: 'ready',      label: 'Ready',      color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
  { value: 'completed',  label: 'Completed',  color: 'bg-green-50 text-green-700 hover:bg-green-100' },
  { value: 'cancelled',  label: 'Cancelled',  color: 'bg-red-50 text-red-700 hover:bg-red-100' },
];

export default function StatusTransitionButtons({ task, onUpdate }) {
  const [loading, setLoading] = useState(false);

  const transition = async (newStatus) => {
    if (newStatus === task.taskStatus) return;
    setLoading(true);
    try {
      const res = await api.patch(`/tenant/tasks/${task._id}/status`, { status: newStatus });
      onUpdate(res.data.data);
      toast.success(`Status → ${STATUSES.find(s => s.value === newStatus)?.label}`);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {STATUSES.map(({ value, label, color }) => (
        <button
          key={value}
          disabled={loading}
          onClick={() => transition(value)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 disabled:opacity-50 ${
            task.taskStatus === value
              ? 'ring-2 ring-offset-1 ring-violet-400 opacity-100'
              : 'opacity-70 hover:opacity-100'
          } ${color}`}
        >
          {task.taskStatus === value ? `● ${label}` : label}
        </button>
      ))}
    </div>
  );
}