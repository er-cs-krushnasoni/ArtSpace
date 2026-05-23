import { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import api from '../../../api/axiosInstance';
import toast from 'react-hot-toast';

export default function RescheduleModal({ task, onClose, onUpdate }) {
  const [date, setDate] = useState(
    task.scheduledDate ? new Date(task.scheduledDate).toISOString().slice(0, 10) : ''
  );
  const [time,   setTime]   = useState(task.scheduledTime ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.patch(`/tenant/tasks/${task._id}/reschedule`, {
        scheduledDate: date || undefined,
        scheduledTime: time || undefined,
      });
      onUpdate(res.data.data);
      toast.success('Schedule updated');
      onClose();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to reschedule');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-violet-500" />
            <h2 className="text-base font-semibold text-gray-900">Reschedule Task</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Customer: <span className="font-medium text-gray-700">{task.customerName}</span>
        </p>

        <div className="space-y-3 mb-5">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              New Date <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              New Time <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-3 py-2 text-sm font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-3 py-2 text-sm font-semibold text-white rounded-lg transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: 'var(--color-primary)' }}
          >
            {saving ? 'Saving…' : 'Save Schedule'}
          </button>
        </div>
      </div>
    </div>
  );
}