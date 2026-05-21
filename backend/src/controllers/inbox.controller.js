const mongoose = require('mongoose');
const { cloudinary } = require('../config/cloudinary');
const Query = require('../models/Query');
const Task = require('../models/Task');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const deleteCloudinaryAssets = async (urls = []) => {
  const validUrls = urls.filter(
    (u) => typeof u === 'string' && u.startsWith('https://res.cloudinary.com')
  );
  if (!validUrls.length) return;

  // Extract public_id from Cloudinary URL
  // URL format: https://res.cloudinary.com/<cloud>/image/upload/v<version>/<folder>/<filename>.<ext>
  const extractPublicId = (url) => {
    try {
      const parts = url.split('/upload/');
      if (parts.length < 2) return null;
      // Remove version segment (v12345/) if present, then strip extension
      const withoutVersion = parts[1].replace(/^v\d+\//, '');
      const withoutExt = withoutVersion.replace(/\.[^/.]+$/, '');
      return withoutExt;
    } catch {
      return null;
    }
  };

  const publicIds = validUrls.map(extractPublicId).filter(Boolean);
  if (!publicIds.length) return;

  try {
    await cloudinary.api.delete_resources(publicIds);
  } catch (err) {
    console.error('[deleteCloudinaryAssets] Failed to delete some assets:', err.message);
    // Non-fatal — log and continue
  }
};

const deriveTaskType = (query) => {
  const { orderType, type } = query;
  if (orderType === 'delivery' || orderType === 'pickup') return 'delivery';
  if (orderType === 'at_shop' || orderType === 'at_home') return 'appointment';
  // fallback for CUSTOM_ORDER / APPOINTMENT with no orderType
  if (type === 'CUSTOM_ORDER' || type === 'APPOINTMENT') return 'appointment';
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
  const tenantId = req.user.tenantId;
  const { queryId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(queryId)) {
    return res.status(404).json({ success: false, message: 'Query not found' });
  }

  const query = await Query.findOne({ _id: queryId, tenantId });
  if (!query) {
    return res.status(404).json({ success: false, message: 'Query not found' });
  }

  if (!['unread', 'reply_later'].includes(query.status)) {
    return res.status(400).json({ success: false, message: 'Query is already seen' });
  }

  query.status = 'seen';
  query.seenAt = new Date();
  await query.save();

  return res.json({ success: true, message: 'Marked as seen' });
};

// ─── PATCH /api/tenant/inbox/:queryId/reply-later ────────────────────────────

const markAsReplyLater = async (req, res) => {
  const tenantId = req.user.tenantId;
  const { queryId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(queryId)) {
    return res.status(404).json({ success: false, message: 'Query not found' });
  }

  const query = await Query.findOne({ _id: queryId, tenantId });
  if (!query) {
    return res.status(404).json({ success: false, message: 'Query not found' });
  }

  if (query.status !== 'unread') {
    return res.status(400).json({ success: false, message: 'Only unread queries can be marked as reply later' });
  }

  query.status = 'reply_later';
  await query.save();

  return res.json({ success: true, message: 'Marked as reply later' });
};

// ─── DELETE /api/tenant/inbox/:queryId ───────────────────────────────────────

const deleteQuery = async (req, res) => {
  const tenantId = req.user.tenantId;
  const { queryId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(queryId)) {
    return res.status(404).json({ success: false, message: 'Query not found' });
  }

  const query = await Query.findOne({ _id: queryId, tenantId });
  if (!query) {
    return res.status(404).json({ success: false, message: 'Query not found' });
  }

  // Delete all Cloudinary assets before removing document
  const allImages = [...(query.referenceImages || []), ...(query.descriptionImages || [])];
  await deleteCloudinaryAssets(allImages);

  await Query.deleteOne({ _id: queryId });

  return res.json({ success: true, message: 'Query deleted' });
};

// ─── POST /api/tenant/inbox/:queryId/confirm ─────────────────────────────────

const confirmOrder = async (req, res) => {
  const tenantId = req.user.tenantId;
  const { queryId } = req.params;
  const {
    scheduledDate, scheduledTime,
    finalPrice,
    // Editable query fields
    customerName, mobile, countryCode, instagram,
    orderType, address, preferredDate, preferredTime, descriptionText,
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(queryId)) {
    return res.status(404).json({ success: false, message: 'Query not found' });
  }

  const query = await Query.findOne({ _id: queryId, tenantId });
  if (!query) {
    return res.status(404).json({ success: false, message: 'Query not found' });
  }

  // Apply any edits from the confirm modal back onto the query fields
  const resolvedCustomerName = (customerName || query.customerName).trim();
  const resolvedMobile = (mobile || query.mobile).trim();
  const resolvedCountryCode = countryCode || query.countryCode;
  const resolvedInstagram = instagram !== undefined ? instagram.trim() : (query.instagram || '');
  const resolvedOrderType = orderType || query.orderType;
  const needsAddress = resolvedOrderType === 'delivery' || resolvedOrderType === 'at_home';
  const resolvedAddress = needsAddress ? (address || query.address || '').trim() : '';

  const taskData = {
    tenantId,
    queryId: query._id,
    customerName: resolvedCustomerName,
    mobile: resolvedMobile,
    countryCode: resolvedCountryCode,
    instagram: resolvedInstagram,
    productId: query.productId || undefined,
    orderType: resolvedOrderType,
    type: deriveTaskType({ ...query.toObject(), orderType: resolvedOrderType }),
    taskStatus: 'confirmed',
    paymentStatus: 'none',
    deliveryStatus: null,
    scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
    scheduledTime: scheduledTime || undefined,
    // finalPrice is optional — if provided, set it now; otherwise left unset for Phase 10
    ...(finalPrice !== undefined && finalPrice !== '' && { finalPrice: Number(finalPrice) }),
  };

  const task = await Task.create(taskData);
  await Query.deleteOne({ _id: queryId });

  return res.status(201).json({
    success: true,
    message: 'Order confirmed',
    data: { taskId: task._id },
  });
};

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  getInbox,
  markAsSeen,
  markAsReplyLater,
  deleteQuery,
  confirmOrder,
};