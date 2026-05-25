import { useState, useEffect, useCallback, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { TrendingUp, ShoppingBag, Wallet, Percent } from 'lucide-react';
import api from '../../api/axiosInstance';

Chart.register(...registerables);

// ─── Constants ────────────────────────────────────────────────────────────────
const RANGES = [
  { label: '7 Days',     value: '7d' },
  { label: '30 Days',    value: '30d' },
  { label: '90 Days',    value: '90d' },
  { label: 'This Month', value: 'thismonth' },
  { label: 'All Time',   value: 'all' },
];

const C = {
  primary:  '#8b5cf6',
  pink:     '#ec4899',
  cyan:     '#06b6d4',
  amber:    '#f59e0b',
  emerald:  '#10b981',
  primaryA: 'rgba(139,92,246,0.15)',
  emeraldA: 'rgba(16,185,129,0.15)',
};

const TYPE_LABELS       = { SHOP_ORDER: 'Shop Orders', CUSTOM_ORDER: 'Custom Orders', APPOINTMENT: 'Appointments' };
const ORDER_TYPE_LABELS = { delivery: 'Delivery', pickup: 'Pickup', at_home: 'At Home', at_shop: 'At Shop' };

const fmtINR  = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const fmtDate = (ds) => { const [, m, d] = ds.split('-'); return `${d}/${m}`; };

const TOOLTIP_DEFAULTS = {
  backgroundColor: '#fff',
  titleColor: '#6b7280',
  bodyColor: '#111827',
  borderColor: '#f3f4f6',
  borderWidth: 1,
  padding: 10,
  cornerRadius: 8,
  titleFont: { size: 11 },
  bodyFont: { size: 12, weight: 'bold' },
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Sk = ({ className = '' }) => (
  <div className={`bg-gray-200 animate-pulse rounded-lg ${className}`} />
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, iconColor, loading }) => (
  <div className="bg-gray-50 rounded-xl p-4">
    <div className="flex items-center justify-between mb-2">
      <p className="text-xs text-gray-500">{label}</p>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: `${iconColor}22` }}>
        <Icon className="w-4 h-4" style={{ color: iconColor }} />
      </div>
    </div>
    {loading ? <Sk className="h-8 w-24 mt-1" /> : (
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    )}
  </div>
);

// ─── Chart Card ───────────────────────────────────────────────────────────────
const ChartCard = ({ title, loading, empty, children }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
    <p className="text-sm font-semibold text-gray-900 mb-4">{title}</p>
    {loading ? <Sk className="h-48 w-full" /> : empty ? (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <TrendingUp className="w-8 h-8 text-gray-300 mb-2" />
        <p className="text-xs text-gray-400">No data for this period</p>
      </div>
    ) : children}
  </div>
);

// ─── useChart hook — mounts/destroys Chart.js instance safely ─────────────────
const useChart = (factory, deps) => {
  const ref = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    if (instanceRef.current) { instanceRef.current.destroy(); instanceRef.current = null; }
    instanceRef.current = factory(ref.current);
    return () => { if (instanceRef.current) { instanceRef.current.destroy(); instanceRef.current = null; } };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  return ref;
};

// ─── Volume Chart ─────────────────────────────────────────────────────────────
const VolumeChart = ({ data }) => {
  const ref = useChart((canvas) => new Chart(canvas, {
    type: 'bar',
    data: {
      labels: data.map((d) => fmtDate(d.date)),
      datasets: [{
        data: data.map((d) => d.count),
        backgroundColor: C.primary,
        borderRadius: 4,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { ...TOOLTIP_DEFAULTS, callbacks: { title: ([i]) => i.label, label: (i) => ` ${i.raw} queries` } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#9ca3af' }, border: { display: false } },
        y: { grid: { color: '#f9fafb' }, ticks: { font: { size: 10 }, color: '#9ca3af', stepSize: 1 }, border: { display: false } },
      },
    },
  }), [data]);
  return <div style={{ height: 200 }}><canvas ref={ref} /></div>;
};

// ─── Revenue Chart ────────────────────────────────────────────────────────────
const RevenueChart = ({ data }) => {
  const ref = useChart((canvas) => new Chart(canvas, {
    type: 'line',
    data: {
      labels: data.map((d) => fmtDate(d.date)),
      datasets: [{
        data: data.map((d) => d.amount),
        borderColor: C.emerald,
        backgroundColor: C.emeraldA,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: C.emerald,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { ...TOOLTIP_DEFAULTS, callbacks: { title: ([i]) => i.label, label: (i) => ` ${fmtINR(i.raw)}` } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#9ca3af' }, border: { display: false } },
        y: { grid: { color: '#f9fafb' }, ticks: { font: { size: 10 }, color: '#9ca3af', callback: (v) => `₹${v}` }, border: { display: false } },
      },
    },
  }), [data]);
  return <div style={{ height: 200 }}><canvas ref={ref} /></div>;
};

// ─── Pie Chart ────────────────────────────────────────────────────────────────
const QueryTypePie = ({ data }) => {
  const filtered = data.filter((d) => d.count > 0);
  const ref = useChart((canvas) => new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: filtered.map((d) => TYPE_LABELS[d.type] || d.type),
      datasets: [{
        data: filtered.map((d) => d.count),
        backgroundColor: [C.primary, C.pink, C.cyan],
        borderWidth: 2,
        borderColor: '#fff',
        hoverOffset: 4,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 12, usePointStyle: true, pointStyleWidth: 8 } },
        tooltip: { ...TOOLTIP_DEFAULTS, callbacks: { label: (i) => ` ${i.label}: ${i.raw}` } },
      },
    },
  }), [data]);
  return <div style={{ height: 220 }}><canvas ref={ref} /></div>;
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [range,   setRange]   = useState('30d');
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/tenant/analytics?range=${range}`);
      setData(res.data.data);
    } catch (err) {
      console.error('[AnalyticsPage]', err);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const sc = data?.statCards || {};

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Business insights for your shop</p>
        </div>
        {/* Range selector */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 flex-wrap">
          {RANGES.map((r) => (
            <button key={r.value} onClick={() => setRange(r.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                range === r.value ? 'bg-violet-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Queries"     value={sc.totalQueries ?? 0}                         icon={TrendingUp}  iconColor={C.primary} loading={loading} />
        <StatCard label="Confirmed Orders"  value={sc.totalConfirmedOrders ?? 0}                 icon={ShoppingBag} iconColor={C.pink}    loading={loading} />
        <StatCard label="Revenue Collected" value={fmtINR(sc.totalRevenue)}                      icon={Wallet}      iconColor={C.emerald} loading={loading} />
        <StatCard label="Conversion Rate"   value={loading ? '—' : `${sc.conversionRate ?? 0}%`} icon={Percent}     iconColor={C.amber}   loading={loading} />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Query Volume Over Time" loading={loading}
          empty={!loading && !data?.queryVolumeByDay?.length}>
          {data?.queryVolumeByDay?.length > 0 && <VolumeChart data={data.queryVolumeByDay} />}
        </ChartCard>

        <ChartCard title="Revenue Over Time" loading={loading}
          empty={!loading && !data?.revenueByDay?.length}>
          {data?.revenueByDay?.length > 0 && <RevenueChart data={data.revenueByDay} />}
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Query Type Breakdown" loading={loading}
          empty={!loading && !data?.queryTypeBreakdown?.some((d) => d.count > 0)}>
          {data?.queryTypeBreakdown?.some((d) => d.count > 0) && (
            <QueryTypePie data={data.queryTypeBreakdown} />
          )}
        </ChartCard>

        {/* Top Products */}
        <ChartCard title="Top Products by Orders" loading={loading}
          empty={!loading && !data?.topProducts?.length}>
          <div className="space-y-3">
            {(data?.topProducts || []).map((p, i) => {
              const max = data.topProducts[0]?.count || 1;
              const pct = Math.round((p.count / max) * 100);
              return (
                <div key={p.productId} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-violet-600">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-gray-800 truncate">{p.name}</p>
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{p.count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-violet-500 transition-all duration-500"
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>
      </div>

      {/* Stats row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Order type breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-semibold text-gray-900 mb-4">Order Type Breakdown</p>
          {loading ? <Sk className="h-32 w-full" /> : (
            <div className="grid grid-cols-2 gap-3">
              {(data?.orderTypeBreakdown || []).map((ot) => (
                <div key={ot.type} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">{ORDER_TYPE_LABELS[ot.type] || ot.type}</p>
                  <p className="text-xl font-semibold text-gray-900">{ot.count}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-semibold text-gray-900 mb-4">Payment Status</p>
          {loading ? <Sk className="h-32 w-full" /> : (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-green-600 font-medium mb-1">Full</p>
                  <p className="text-xl font-semibold text-green-700">{data?.paymentBreakdown?.full ?? 0}</p>
                </div>
                <div className="bg-yellow-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-yellow-600 font-medium mb-1">Partial</p>
                  <p className="text-xl font-semibold text-yellow-700">{data?.paymentBreakdown?.partial ?? 0}</p>
                </div>
                <div className="bg-red-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-red-600 font-medium mb-1">None</p>
                  <p className="text-xl font-semibold text-red-700">{data?.paymentBreakdown?.none ?? 0}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500">Total Collected</p>
                  <p className="text-sm font-semibold text-emerald-600">{fmtINR(data?.paymentBreakdown?.totalCollected)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Total Pending</p>
                  <p className="text-sm font-semibold text-red-500">{fmtINR(data?.paymentBreakdown?.totalPending)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}