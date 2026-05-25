const mongoose = require('mongoose');
const { cloudinary } = require('../config/cloudinary');
const Query = require('../models/Query');
const Task  = require('../models/Task');
const AnalyticsSnapshot = require('../models/AnalyticsSnapshot');
const Product           = require('../models/Product');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const deleteCloudinaryAssets = async (urls = []) => {
  const validUrls = urls.filter(
    (u) => typeof u === 'string' && u.startsWith('https://res.cloudinary.com')
  );
  if (!validUrls.length) return;

  const extractPublicId = (url) => {
    try {
      const parts = url.split('/upload/');
      if (parts.length < 2) return null;
      const withoutVersion = parts[1].replace(/^v\d+\//, '');
      const withoutExt     = withoutVersion.replace(/\.[^/.]+$/, '');
      return withoutExt;
    } catch { return null; }
  };

  const publicIds = validUrls.map(extractPublicId).filter(Boolean);
  if (!publicIds.length) return;

  try {
    await cloudinary.api.delete_resources(publicIds);
  } catch (err) {
    console.error('[deleteCloudinaryAssets] Failed to delete some assets:', err.message);
  }
};

const deriveTaskType = (query) => {
  const { orderType, type } = query;
  if (orderType === 'delivery' || orderType === 'pickup') return 'delivery';
  if (orderType === 'at_shop'  || orderType === 'at_home') return 'appointment';
  if (type === 'CUSTOM_ORDER'  || type === 'APPOINTMENT')  return 'appointment';
  return 'appointment';
};

// ─── GET /api/tenant/inbox ────────────────────────────────────────────────────

const getInbox = async (req, res) => {
  const tenantId = req.user.tenantId;

  const queries = await Query.find({
    tenantId,
    status: { $in: ['unread', 'reply_later'] },
  })
    .sort({ createdAt: -1 })
    .populate('productId', 'name nameVisible photos deliveryEnabled appointmentEnabled deliveryPrice appointmentPrice')
    .lean();

  return res.json({ success: true, data: queries });
};

// ─── PATCH /api/tenant/inbox/:queryId/seen ────────────────────────────────────

const markAsSeen = async (req, res) => {
  const tenantId  = req.user.tenantId;
  const { queryId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(queryId))
    return res.status(404).json({ success: false, message: 'Query not found' });

  const query = await Query.findOne({ _id: queryId, tenantId });
  if (!query)
    return res.status(404).json({ success: false, message: 'Query not found' });

  if (!['unread', 'reply_later'].includes(query.status))
    return res.status(400).json({ success: false, message: 'Query is already seen' });

  query.status = 'seen';
  query.seenAt = new Date();
  await query.save();
  return res.json({ success: true, message: 'Marked as seen' });
};

// ─── PATCH /api/tenant/inbox/:queryId/reply-later ────────────────────────────

const markAsReplyLater = async (req, res) => {
  const tenantId    = req.user.tenantId;
  const { queryId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(queryId))
    return res.status(404).json({ success: false, message: 'Query not found' });

  const query = await Query.findOne({ _id: queryId, tenantId });
  if (!query)
    return res.status(404).json({ success: false, message: 'Query not found' });

  if (!['unread', 'seen'].includes(query.status))
    return res.status(400).json({ success: false, message: 'Cannot move to reply later from this state' });

  query.status = 'reply_later';
  query.seenAt = null;
  await query.save();
  return res.json({ success: true, message: 'Marked as reply later' });
};

// ─── DELETE /api/tenant/inbox/:queryId ───────────────────────────────────────

const deleteQuery = async (req, res) => {
  const tenantId  = req.user.tenantId;
  const { queryId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(queryId))
    return res.status(404).json({ success: false, message: 'Query not found' });

  const query = await Query.findOne({ _id: queryId, tenantId });
  if (!query)
    return res.status(404).json({ success: false, message: 'Query not found' });

  const allImages = [...(query.referenceImages || []), ...(query.descriptionImages || [])];
  await deleteCloudinaryAssets(allImages);
  await Query.deleteOne({ _id: queryId });
  return res.json({ success: true, message: 'Query deleted' });
};

// ─── POST /api/tenant/inbox/:queryId/confirm ─────────────────────────────────
const confirmOrder = async (req, res) => {
  const tenantId  = req.user.tenantId;
  const { queryId } = req.params;
  const {
    scheduledDate, scheduledTime,
    finalPrice,
    customerName, mobile, countryCode, instagram,
    orderType, address,
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(queryId))
    return res.status(404).json({ success: false, message: 'Query not found' });

  const query = await Query.findOne({ _id: queryId, tenantId });
  if (!query)
    return res.status(404).json({ success: false, message: 'Query not found' });

  const resolvedCustomerName = (customerName || query.customerName || '').trim();
  const resolvedMobile       = (mobile       || query.mobile       || '').trim();
  const resolvedCountryCode  = countryCode   || query.countryCode  || '+91';
  const resolvedInstagram    = instagram !== undefined ? instagram.trim() : (query.instagram || '');
  const resolvedOrderType    = orderType  || query.orderType;
  const needsAddress         = resolvedOrderType === 'delivery' || resolvedOrderType === 'at_home';
  const resolvedAddress      = needsAddress ? (address || query.address || '').trim() : '';

  const taskData = {
    tenantId,
    queryId:      query._id,
    customerName: resolvedCustomerName,
    mobile:       resolvedMobile,
    countryCode:  resolvedCountryCode,
    instagram:    resolvedInstagram,
    productId:    query.productId || undefined,
    orderType:    resolvedOrderType,
    address:      resolvedAddress,
    type:         deriveTaskType({ ...query.toObject(), orderType: resolvedOrderType }),
    taskStatus:   'pending',
    paymentEntries: [],
    totalPaid:    0,
    amountPending: 0,
    paymentStatus: 'none',
    scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
    scheduledTime: scheduledTime || undefined,
    referenceImages:   query.referenceImages   || [],
    descriptionImages: query.descriptionImages || [],
    descriptionText:   query.descriptionText   || '',
    ...(finalPrice !== undefined && finalPrice !== '' && { finalPrice: Number(finalPrice) }),
  };

  const task = await Task.create(taskData);
  await Query.deleteOne({ _id: queryId });

  // ── Update query snapshot → mark confirmed ────────────────────────────────
  // ── Create task snapshot ──────────────────────────────────────────────────
  try {
    // Mark the query snapshot as confirmed
    await AnalyticsSnapshot.findOneAndUpdate(
      { queryId: query._id, type: 'query' },
      { $set: { isConfirmed: true } }
    );

    // Fetch product name
    let productName = '';
    if (query.productId) {
      const product = await Product.findById(query.productId).select('name').lean();
      if (product) productName = product.name || '';
    }

    // Create task snapshot
    await AnalyticsSnapshot.create({
      tenantId,
      type:        'task',
      taskId:      task._id,
      confirmedAt: task.createdAt,
      queryType:   query.type,
      orderType:   resolvedOrderType,
      productId:   query.productId || undefined,
      productName,
      totalPaid:     0,
      finalPrice:    finalPrice !== undefined && finalPrice !== '' ? Number(finalPrice) : null,
      paymentStatus: 'none',
      amountPending: finalPrice !== undefined && finalPrice !== '' ? Number(finalPrice) : 0,
      paymentEntries: [],
    });
  } catch (snapErr) {
    console.error('[confirmOrder] snapshot error:', snapErr.message);
  }

  return res.status(201).json({
    success: true,
    message: 'Order confirmed',
    data: { taskId: task._id },
  });
};

const markAsUnread = async (req, res) => {
  const tenantId    = req.user.tenantId;
  const { queryId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(queryId))
    return res.status(404).json({ success: false, message: 'Query not found' });

  const query = await Query.findOne({ _id: queryId, tenantId });
  if (!query)
    return res.status(404).json({ success: false, message: 'Query not found' });

  query.status = 'unread';
  query.seenAt = null;
  await query.save();
  return res.json({ success: true, message: 'Moved to unread' });
};

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  getInbox,
  markAsSeen,
  markAsReplyLater,
  deleteQuery,
  confirmOrder,
  markAsUnread
};