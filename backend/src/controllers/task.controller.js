const mongoose = require('mongoose');
const Task = require('../models/Task');

// ─── Payment recalculator ─────────────────────────────────────────────────────
const recalcPayment = (task) => {
  const total = (task.paymentEntries || []).reduce((sum, e) => sum + (e.amount || 0), 0);
  task.totalPaid     = total;
  task.amountPending = task.finalPrice ? Math.max(0, task.finalPrice - total) : 0;

  if (!task.finalPrice || task.finalPrice === 0) {
    task.paymentStatus = 'none';
  } else if (total >= task.finalPrice) {
    task.paymentStatus = 'full';
  } else if (total > 0) {
    task.paymentStatus = 'partial';
  } else {
    task.paymentStatus = 'none';
  }

  // 7-day cron timer: only when BOTH completed AND fully paid
  if (task.taskStatus === 'completed' && task.paymentStatus === 'full') {
    if (!task.completedAt) task.completedAt = new Date(); // set only once, don't reset
  } else if (task.taskStatus === 'completed' && task.paymentStatus !== 'full') {
    task.completedAt = null; // payment regressed (entry deleted) — pause timer
  }
  // If not in completed state, completedAt is managed by updateTaskStatus
};

// ─── GET /api/tenant/tasks ────────────────────────────────────────────────────
const getTasks = async (req, res) => {
  const tenantId = req.user.tenantId;
  const { date, status } = req.query;

  const filter = { tenantId };

  if (date) {
    const day   = new Date(date);
    const start = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), 0, 0, 0));
    const end   = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), 23, 59, 59, 999));
    filter.scheduledDate = { $gte: start, $lte: end };
  }

  if (status) {
    const statuses = status.split(',').map((s) => s.trim()).filter(Boolean);
    if (statuses.length) filter.taskStatus = { $in: statuses };
  }

  const tasks = await Task.find(filter)
    .populate('productId', 'name nameVisible photos')
    .sort({ scheduledDate: 1 })
    .lean();

  // Summary counts
  const allActive = await Task.find({ tenantId }).lean();
  const now = new Date();
  const IST_OFF = 5.5 * 60 * 60 * 1000;
  const istNow  = new Date(now.getTime() + IST_OFF);
  const yyyy = istNow.getUTCFullYear();
  const mm   = istNow.getUTCMonth();
  const dd   = istNow.getUTCDate();
  const todayStart = new Date(Date.UTC(yyyy, mm, dd, 0, 0, 0) - IST_OFF);
  const todayEnd   = new Date(Date.UTC(yyyy, mm, dd, 23, 59, 59, 999) - IST_OFF);

  const todayAppointments = allActive.filter(
    (t) => t.type === 'appointment' && t.scheduledDate &&
      t.scheduledDate >= todayStart && t.scheduledDate <= todayEnd
  ).length;
  const todayDeliveries = allActive.filter(
    (t) => t.type === 'delivery' && t.scheduledDate &&
      t.scheduledDate >= todayStart && t.scheduledDate <= todayEnd
  ).length;
  const pending    = allActive.filter((t) => t.taskStatus === 'pending').length;
  const processing = allActive.filter((t) => t.taskStatus === 'processing').length;

  return res.json({
    success: true,
    data: tasks,
    summary: { todayAppointments, todayDeliveries, pending, processing },
  });
};

// ─── PATCH /api/tenant/tasks/:taskId/status ───────────────────────────────────
const updateTaskStatus = async (req, res) => {
  const tenantId   = req.user.tenantId;
  const { taskId } = req.params;
  const { status } = req.body;

  const VALID = ['pending', 'processing', 'ready', 'completed', 'cancelled'];
  if (!mongoose.Types.ObjectId.isValid(taskId))
    return res.status(404).json({ success: false, message: 'Task not found' });
  if (!VALID.includes(status))
    return res.status(400).json({ success: false, message: 'Invalid status' });

  const task = await Task.findOne({ _id: taskId, tenantId });
  if (!task)
    return res.status(404).json({ success: false, message: 'Task not found' });

  task.taskStatus = status;

// cancelledAt: set when cancelled, clear otherwise
task.cancelledAt = status === 'cancelled' ? new Date() : null;

// completedTimestamp: display only — set the moment admin marks completed, clear when moved away
task.completedTimestamp = status === 'completed'
  ? (task.completedTimestamp || new Date()) // keep original if already set
  : null;

// completedAt: cron timer — only set when completed AND payment is full
// If moving away from completed, clear it
if (status !== 'completed') {
  task.completedAt = null;
} else {
  // Will be set by recalcPayment if payment is full, or stays null
  // Don't touch it here — recalcPayment handles it
  if (task.paymentStatus === 'full' && !task.completedAt) {
    task.completedAt = new Date();
  }
}

  await task.save();
  await task.populate('productId', 'name nameVisible photos');
  return res.json({ success: true, data: task });
};

// ─── PATCH /api/tenant/tasks/:taskId/final-price ──────────────────────────────
const updateFinalPrice = async (req, res) => {
  const tenantId   = req.user.tenantId;
  const { taskId } = req.params;
  const { finalPrice } = req.body;

  if (!mongoose.Types.ObjectId.isValid(taskId))
    return res.status(404).json({ success: false, message: 'Task not found' });

  const task = await Task.findOne({ _id: taskId, tenantId });
  if (!task)
    return res.status(404).json({ success: false, message: 'Task not found' });

  task.finalPrice = finalPrice != null ? Number(finalPrice) : null;
  recalcPayment(task);
  await task.save();
  await task.populate('productId', 'name nameVisible photos');
  return res.json({ success: true, data: task });
};

// ─── POST /api/tenant/tasks/:taskId/payment-entries ───────────────────────────
const addPaymentEntry = async (req, res) => {
  const tenantId   = req.user.tenantId;
  const { taskId } = req.params;
  const { amount, date, note } = req.body;

  if (!mongoose.Types.ObjectId.isValid(taskId))
    return res.status(404).json({ success: false, message: 'Task not found' });
  if (!amount || !date)
    return res.status(400).json({ success: false, message: 'amount and date are required' });

  const task = await Task.findOne({ _id: taskId, tenantId });
  if (!task)
    return res.status(404).json({ success: false, message: 'Task not found' });
  if (!task.finalPrice)
    return res.status(400).json({ success: false, message: 'Set final price before adding payment entries' });

  task.paymentEntries.push({ amount: Number(amount), date: new Date(date), note: note || '' });
  recalcPayment(task);
  await task.save();
  await task.populate('productId', 'name nameVisible photos');
  return res.json({ success: true, data: task });
};

// ─── PATCH /api/tenant/tasks/:taskId/payment-entries/:entryId ────────────────
const updatePaymentEntry = async (req, res) => {
  const tenantId   = req.user.tenantId;
  const { taskId, entryId } = req.params;
  const { amount, date, note } = req.body;

  if (!mongoose.Types.ObjectId.isValid(taskId))
    return res.status(404).json({ success: false, message: 'Task not found' });

  const task = await Task.findOne({ _id: taskId, tenantId });
  if (!task)
    return res.status(404).json({ success: false, message: 'Task not found' });

  const entry = task.paymentEntries.id(entryId);
  if (!entry)
    return res.status(404).json({ success: false, message: 'Payment entry not found' });

  if (amount !== undefined) entry.amount = Number(amount);
  if (date   !== undefined) entry.date   = new Date(date);
  if (note   !== undefined) entry.note   = note;

  recalcPayment(task);
  await task.save();
  await task.populate('productId', 'name nameVisible photos');
  return res.json({ success: true, data: task });
};

// ─── DELETE /api/tenant/tasks/:taskId/payment-entries/:entryId ───────────────
const deletePaymentEntry = async (req, res) => {
  const tenantId   = req.user.tenantId;
  const { taskId, entryId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(taskId))
    return res.status(404).json({ success: false, message: 'Task not found' });

  const task = await Task.findOne({ _id: taskId, tenantId });
  if (!task)
    return res.status(404).json({ success: false, message: 'Task not found' });

  const entry = task.paymentEntries.id(entryId);
  if (!entry)
    return res.status(404).json({ success: false, message: 'Payment entry not found' });

  entry.deleteOne();
  recalcPayment(task);
  await task.save();
  await task.populate('productId', 'name nameVisible photos');
  return res.json({ success: true, data: task });
};

// ─── PATCH /api/tenant/tasks/:taskId/notes ────────────────────────────────────
const updateAdminNotes = async (req, res) => {
  const tenantId   = req.user.tenantId;
  const { taskId } = req.params;
  const { adminNotes } = req.body;

  if (!mongoose.Types.ObjectId.isValid(taskId))
    return res.status(404).json({ success: false, message: 'Task not found' });

  const task = await Task.findOne({ _id: taskId, tenantId });
  if (!task)
    return res.status(404).json({ success: false, message: 'Task not found' });

  task.adminNotes = adminNotes || '';
  await task.save();
  return res.json({ success: true, data: { adminNotes: task.adminNotes } });
};

// ─── PATCH /api/tenant/tasks/:taskId/reschedule ───────────────────────────────
const rescheduleTask = async (req, res) => {
  const tenantId   = req.user.tenantId;
  const { taskId } = req.params;
  const { scheduledDate, scheduledTime } = req.body;

  if (!mongoose.Types.ObjectId.isValid(taskId))
    return res.status(404).json({ success: false, message: 'Task not found' });

  const task = await Task.findOne({ _id: taskId, tenantId });
  if (!task)
    return res.status(404).json({ success: false, message: 'Task not found' });

  if (scheduledDate !== undefined)
    task.scheduledDate = scheduledDate ? new Date(scheduledDate) : undefined;
  if (scheduledTime !== undefined)
    task.scheduledTime = scheduledTime || undefined;

  await task.save();
  await task.populate('productId', 'name nameVisible photos');
  return res.json({ success: true, data: task });
};

// ─── DELETE /api/tenant/tasks/:taskId ────────────────────────────────────────
const deleteTask = async (req, res) => {
  const tenantId   = req.user.tenantId;
  const { taskId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(taskId))
    return res.status(404).json({ success: false, message: 'Task not found' });

  const task = await Task.findOne({ _id: taskId, tenantId });
  if (!task)
    return res.status(404).json({ success: false, message: 'Task not found' });

  await Task.deleteOne({ _id: taskId });
  return res.json({ success: true, message: 'Task deleted' });
};

module.exports = {
  getTasks,
  updateTaskStatus,
  updateFinalPrice,
  addPaymentEntry,
  updatePaymentEntry,
  deletePaymentEntry,
  updateAdminNotes,
  rescheduleTask,
  deleteTask,
};