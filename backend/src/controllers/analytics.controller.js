const AnalyticsSnapshot = require('../models/AnalyticsSnapshot');
const mongoose = require('mongoose');

// ─── Date range helper ────────────────────────────────────────────────────────
const getDateRange = (range) => {
  const now   = new Date();
  const today = new Date(Date.UTC(
    now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999
  ));

  if (range === 'all') return null;

  const daysMap = { '7d': 6, '30d': 29, '90d': 89 };
  let from;

  if (daysMap[range] !== undefined) {
    from = new Date(today);
    from.setUTCDate(today.getUTCDate() - daysMap[range]);
    from.setUTCHours(0, 0, 0, 0);
  } else if (range === 'thismonth') {
    from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
  } else {
    from = new Date(today);
    from.setUTCDate(today.getUTCDate() - 29);
    from.setUTCHours(0, 0, 0, 0);
  }

  return { from, to: today };
};

const toDateStr = (date) => {
  const d = new Date(date);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
};

// ─── GET /api/tenant/analytics ────────────────────────────────────────────────
const getAnalytics = async (req, res) => {
  const tenantId = req.user.tenantId;
  const VALID_RANGES = ['7d', '30d', '90d', 'thismonth', 'all'];
  const range     = VALID_RANGES.includes(req.query.range) ? req.query.range : '30d';
  const dateRange = getDateRange(range);
  const tenantObjId = new mongoose.Types.ObjectId(tenantId);

  const dateFilter = dateRange ? { $gte: dateRange.from, $lte: dateRange.to } : null;

  // ── Query snapshots (all submitted queries — permanent) ───────────────────
  const querySnapFilter = { tenantId: tenantObjId, type: 'query' };
  if (dateFilter) querySnapFilter.submittedAt = dateFilter;
  const querySnaps = await AnalyticsSnapshot.find(querySnapFilter).lean();
  const totalQueries = querySnaps.length;

  // ── Task snapshots in range (confirmed + not cancelled) ───────────────────
  const taskSnapFilter = { tenantId: tenantObjId, type: 'task', isExcluded: { $ne: true } };
  if (dateFilter) taskSnapFilter.confirmedAt = dateFilter;
  const taskSnaps = await AnalyticsSnapshot.find(taskSnapFilter).lean();
  const totalConfirmedOrders = taskSnaps.length;

  // Conversion rate
  const conversionRate = totalQueries > 0
    ? Math.round((totalConfirmedOrders / totalQueries) * 1000) / 10
    : 0;

  // ── Revenue (all task snapshots, filter by payment entry date) ────────────
  const allTaskSnaps = await AnalyticsSnapshot.find({
    tenantId: tenantObjId,
    type: 'task',
    isExcluded: { $ne: true },
  }).lean();

  let totalRevenue = 0;
  const revenueByDayMap = {};
  allTaskSnaps.forEach((snap) => {
    (snap.paymentEntries || []).forEach((entry) => {
      const entryDate = new Date(entry.date);
      if (dateFilter && (entryDate < dateRange.from || entryDate > dateRange.to)) return;
      totalRevenue += entry.amount || 0;
      const ds = toDateStr(entryDate);
      revenueByDayMap[ds] = (revenueByDayMap[ds] || 0) + (entry.amount || 0);
    });
  });

  // ── Query type breakdown ──────────────────────────────────────────────────
  // All submitted queries (query snaps) — includes confirmed + unconfirmed + deleted
  const queryTypeMap = { SHOP_ORDER: 0, CUSTOM_ORDER: 0, APPOINTMENT: 0 };
  querySnaps.forEach((s) => {
    if (s.queryType && queryTypeMap[s.queryType] !== undefined) queryTypeMap[s.queryType]++;
  });
  const queryTypeBreakdown = Object.entries(queryTypeMap).map(([type, count]) => ({ type, count }));

  // ── Query volume by day (all submitted queries in range) ──────────────────
  const volumeByDayMap = {};
  querySnaps.forEach((s) => {
    const ds = toDateStr(s.submittedAt);
    volumeByDayMap[ds] = (volumeByDayMap[ds] || 0) + 1;
  });
  const queryVolumeByDay = Object.entries(volumeByDayMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  // ── Revenue by day ────────────────────────────────────────────────────────
  const revenueByDay = Object.entries(revenueByDayMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({ date, amount }));

  // ── Top products (from task snaps in range) ───────────────────────────────
  const productCountMap = {};
  const productNameMap  = {};
  taskSnaps.forEach((s) => {
    if (s.productId) {
      const pid = s.productId.toString();
      productCountMap[pid] = (productCountMap[pid] || 0) + 1;
      if (s.productName) productNameMap[pid] = s.productName;
    }
  });
  const topProducts = Object.entries(productCountMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([productId, count]) => ({
      productId,
      name:  productNameMap[productId] || 'Unknown Product',
      count,
    }));

  // ── Order type breakdown (task snaps in range) ────────────────────────────
  const orderTypeMap = {};
  taskSnaps.forEach((s) => {
    const ot = s.orderType || 'unknown';
    orderTypeMap[ot] = (orderTypeMap[ot] || 0) + 1;
  });
  const orderTypeBreakdown = ['delivery', 'pickup', 'at_home', 'at_shop'].map((type) => ({
    type,
    count: orderTypeMap[type] || 0,
  }));

  // ── Payment breakdown (ALL task snaps, no date filter) ────────────────────
  const payBreakdown = { full: 0, partial: 0, none: 0 };
  let totalCollected = 0;
  let totalPending   = 0;
  allTaskSnaps.forEach((s) => {
    const ps = s.paymentStatus || 'none';
    payBreakdown[ps] = (payBreakdown[ps] || 0) + 1;
    totalCollected  += s.totalPaid     || 0;
    totalPending    += s.amountPending || 0;
  });

  return res.json({
    success: true,
    data: {
      range,
      statCards: { totalQueries, totalConfirmedOrders, totalRevenue, conversionRate },
      queryTypeBreakdown,
      queryVolumeByDay,
      revenueByDay,
      topProducts,
      orderTypeBreakdown,
      paymentBreakdown: { ...payBreakdown, totalCollected, totalPending },
    },
  });
};

module.exports = { getAnalytics };