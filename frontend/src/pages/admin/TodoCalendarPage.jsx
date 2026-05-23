import { useState, useEffect, useCallback } from 'react';
import { CalendarCheck, ChevronLeft, ChevronRight,CheckCircle2,XCircle , List, Calendar as CalIcon } from 'lucide-react';
import api from '../../api/axiosInstance';
import TaskCard from '../../components/admin/tasks/TaskCard';

// ─── Status filter tabs ───────────────────────────────────────────────────────

const STATUS_TABS = [
  { label: 'All',        value: '' },
  { label: 'Pending',    value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Ready',      value: 'ready' },
  { label: 'Completed',  value: 'completed' },
  { label: 'Cancelled',  value: 'cancelled' },
];

// ─── Date helpers ─────────────────────────────────────────────────────────────

const toYMD = (d) => d.toISOString().slice(0, 10);

const fmtDateHeader = (ymd) => {
  const d = new Date(ymd + 'T00:00:00');
  const today     = toYMD(new Date());
  const tomorrow  = toYMD(new Date(Date.now() + 86400000));
  if (ymd === today)    return `Today, ${d.toLocaleDateString('en-IN', { month: 'long', day: 'numeric' })}`;
  if (ymd === tomorrow) return `Tomorrow, ${d.toLocaleDateString('en-IN', { month: 'long', day: 'numeric' })}`;
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long' });
};

// ─── Mini Calendar ────────────────────────────────────────────────────────────

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function MiniCalendar({ tasks, selectedDay, onSelectDay }) {
  const [viewDate, setViewDate] = useState(new Date());

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay   = new Date(year, month, 1).getDay();
  const daysInMonth= new Date(year, month + 1, 0).getDate();
  const todayYMD   = toYMD(new Date());

  // Build set of dates that have tasks
  const taskDates = new Map(); // ymd → { hasActive, allDone }
  tasks.forEach((t) => {
    if (!t.scheduledDate) return;
    const ymd = toYMD(new Date(t.scheduledDate));
    if (!taskDates.has(ymd)) taskDates.set(ymd, { hasActive: false, allDone: true });
    const entry = taskDates.get(ymd);
if (['pending', 'processing', 'ready'].includes(t.taskStatus)) entry.hasActive = true;
    if (!['completed'].includes(t.taskStatus)) entry.allDone = false;
  });

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthName = viewDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-4 mb-4">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <p className="text-sm font-semibold text-gray-800">{monthName}</p>
        <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const ymd       = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday   = ymd === todayYMD;
          const isSelected= ymd === selectedDay;
          const info      = taskDates.get(ymd);

          return (
            <button
              key={ymd}
              onClick={() => onSelectDay(ymd === selectedDay ? null : ymd)}
              className={`
                relative flex flex-col items-center justify-center rounded-lg py-1.5 text-xs font-medium
                transition-all duration-150
                ${isSelected ? 'bg-violet-600 text-white' : isToday ? 'bg-violet-100 text-violet-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'}
              `}
            >
              {day}
              {info && (
                <span className={`
                  w-1.5 h-1.5 rounded-full mt-0.5
                  ${isSelected ? 'bg-white/70' : info.hasActive ? 'bg-violet-500' : 'bg-green-400'}
                `} />
              )}
            </button>
          );
        })}
      </div>

      {selectedDay && (
        <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {new Date(selectedDay + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <button
            onClick={() => onSelectDay(null)}
            className="text-xs text-violet-600 hover:underline"
          >
            Clear filter
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Group tasks by date for list view ───────────────────────────────────────

function groupByDate(tasks) {
  const groups = {};
  const noDate = [];
  tasks.forEach((t) => {
    if (!t.scheduledDate) { noDate.push(t); return; }
    const ymd = toYMD(new Date(t.scheduledDate));
    if (!groups[ymd]) groups[ymd] = [];
    groups[ymd].push(t);
  });
  // Sort: ascending by date (past first, then future)
  const sorted = Object.keys(groups).sort((a, b) => a.localeCompare(b));
  return { sorted, groups, noDate };
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Skeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 animate-pulse">
        <div className="flex gap-2 mb-2">
          <div className="h-5 w-20 bg-gray-200 rounded-full" />
          <div className="h-5 w-16 bg-gray-200 rounded-full" />
        </div>
        <div className="h-4 w-40 bg-gray-200 rounded mb-1" />
        <div className="h-3 w-28 bg-gray-200 rounded" />
      </div>
    ))}
  </div>
);

// ─── Main page ────────────────────────────────────────────────────────────────

export default function TodoCalendarPage() {
  const [tasks,      setTasks]      = useState([]);
  const [summary,    setSummary]    = useState({});
  const [loading,    setLoading]    = useState(true);
  const [view,       setView]       = useState('list'); // 'list' | 'calendar'
  const [statusTab,  setStatusTab]  = useState('');
  const [selectedDay,setSelectedDay]= useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusTab)   params.set('status', statusTab);
      if (selectedDay) params.set('date',   selectedDay);
      const res = await api.get(`/tenant/tasks?${params}`);
      setTasks(res.data.data   || []);
      setSummary(res.data.summary || {});
    } catch {
      // handled silently
    } finally {
      setLoading(false);
    }
  }, [statusTab, selectedDay]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleDeleted = (id) => setTasks((prev) => prev.filter((t) => t._id !== id));
  const handleUpdated = (updated) =>
    setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));

  // For calendar dot rendering we always want all tasks (no status filter)
  // Re-use the already-fetched list; calendar just further filters by selected day
  const calendarTasks = selectedDay
    ? tasks.filter((t) => t.scheduledDate && toYMD(new Date(t.scheduledDate)) === selectedDay)
    : tasks;

  const { sorted, groups, noDate } = groupByDate(calendarTasks);

  const allDisplayed = [...sorted.flatMap((d) => groups[d]), ...noDate];

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Todo Calendar</h1>
          <p className="text-sm text-gray-500 mt-0.5">
  {summary.pending    > 0 && `${summary.pending} pending`}
  {summary.pending    > 0 && summary.processing > 0 && ' · '}
  {summary.processing > 0 && `${summary.processing} processing`}
  {!summary.pending   && !summary.processing && 'All tasks'}
</p>
        </div>
        {/* View toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setView('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              view === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <List className="w-3.5 h-3.5" /> List
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              view === 'calendar' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <CalIcon className="w-3.5 h-3.5" /> Calendar
          </button>
        </div>
      </div>

      {/* Calendar view — mini calendar on top */}
      {view === 'calendar' && (
        <MiniCalendar
          tasks={tasks}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
        />
      )}

      {/* Status filter tabs */}
      <div className="flex gap-1.5 flex-wrap mb-4">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusTab(tab.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              statusTab === tab.value
                ? 'text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={statusTab === tab.value ? { background: 'var(--color-primary)' } : {}}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Auto-delete notices */}
{statusTab === 'completed' && (
  <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-green-50 border border-green-100 rounded-lg text-xs text-green-700">
    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
    Completed tasks are automatically deleted 7 days after completion, but only once payment is fully received.
  </div>
)}
{statusTab === 'cancelled' && (
  <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700">
    <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
    Cancelled tasks are automatically deleted after 48 hours. You can still change the status before then to recover them.
  </div>
)}

      {/* Task list */}
{loading ? (
  <Skeleton />
) : (noDate.length === 0 && sorted.length === 0) ? (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <CalendarCheck className="w-10 h-10 text-gray-300 mb-3" />
    <p className="text-sm font-medium text-gray-500">No tasks yet</p>
    <p className="text-xs text-gray-400 mt-1">Confirmed orders will appear here</p>
  </div>
) : (
  <div className="space-y-1">
    {/* Unscheduled tasks — top */}
    {noDate.length > 0 && (
      <div>
        <div className="flex items-center gap-2 py-2">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs font-medium text-amber-500 whitespace-nowrap">⚠ No Date Scheduled</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>
        <div className="space-y-2">
          {noDate.map((task) => (
            <TaskCard key={task._id} task={task} onDeleted={handleDeleted} />
          ))}
        </div>
      </div>
    )}
    {/* Scheduled tasks — ascending date */}
    {sorted.map((ymd) => (
      <div key={ymd}>
        <div className="flex items-center gap-2 py-2">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs font-medium text-gray-400 whitespace-nowrap">
            {fmtDateHeader(ymd)}
          </span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>
        <div className="space-y-2">
          {groups[ymd].map((task) => (
            <TaskCard key={task._id} task={task} onDeleted={handleDeleted} />
          ))}
        </div>
      </div>
    ))}
  </div>
)}
    </div>
  );
}