const Product = require('../models/Product');
const Category = require('../models/Category');
const { deleteFromCloudinary } = require('../config/cloudinary');

// ─── Helpers ──────────────────────────────────────────────────────────────────
const validateCategoryOwnership = async (categoryIds, tenantId) => {
  if (!categoryIds || categoryIds.length === 0) return true;
  const count = await Category.countDocuments({
    _id: { $in: categoryIds },
    tenantId,
  });
  return count === categoryIds.length;
};

const deletePhotosFromCloudinary = async (photos = []) => {
  for (const photo of photos) {
    if (photo.publicId) {
      await deleteFromCloudinary(photo.publicId, 'image').catch((e) =>
        console.error(`Cloudinary delete failed for ${photo.publicId}:`, e.message)
      );
    }
  }
};

// ─── GET /api/tenant/products ─────────────────────────────────────────────────
const getProducts = async (req, res) => {
  const products = await Product.find({ tenantId: req.user.tenantId })
    .populate('categories', 'groupName values')
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, data: products });
};

// ─── POST /api/tenant/products ────────────────────────────────────────────────
const createProduct = async (req, res) => {
  const {
    name, nameVisible, description,
    deliveryEnabled, appointmentEnabled,
    deliveryPrice, appointmentPrice,
    categories, isActive, photos,
  } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Product name is required' });
  }

  // At least one service must be enabled for this product
  const hasDelivery = deliveryEnabled === true;
  const hasAppointment = appointmentEnabled === true;

  if (!hasDelivery && !hasAppointment) {
    return res.status(400).json({ success: false, message: 'At least one service (delivery or appointment) must be enabled' });
  }
  if (hasDelivery && (deliveryPrice === null || deliveryPrice === undefined || deliveryPrice === '')) {
    return res.status(400).json({ success: false, message: 'Delivery price is required when delivery is enabled' });
  }
  if (hasAppointment && (appointmentPrice === null || appointmentPrice === undefined || appointmentPrice === '')) {
    return res.status(400).json({ success: false, message: 'Appointment price is required when appointment is enabled' });
  }
  if (hasDelivery && Number(deliveryPrice) < 0) {
    return res.status(400).json({ success: false, message: 'Delivery price must be 0 or more' });
  }
  if (hasAppointment && Number(appointmentPrice) < 0) {
    return res.status(400).json({ success: false, message: 'Appointment price must be 0 or more' });
  }

  const cleanPhotos = Array.isArray(photos) ? photos.filter((p) => p.url && p.publicId) : [];
  if (cleanPhotos.length > 5) {
    return res.status(400).json({ success: false, message: 'Maximum 5 photos allowed per product' });
  }

  const catIds = Array.isArray(categories) ? categories : [];
  if (catIds.length > 0) {
    const valid = await validateCategoryOwnership(catIds, req.user.tenantId);
    if (!valid) {
      return res.status(400).json({ success: false, message: 'One or more categories are invalid' });
    }
  }

  const product = await Product.create({
    tenantId: req.user.tenantId,
    name: name.trim(),
    nameVisible: nameVisible !== false,
    description: typeof description === 'string' ? description.trim() : '',
    photos: cleanPhotos,
    deliveryEnabled: hasDelivery,
    appointmentEnabled: hasAppointment,
    deliveryPrice: hasDelivery ? Number(deliveryPrice) : null,
    appointmentPrice: hasAppointment ? Number(appointmentPrice) : null,
    categories: catIds,
    isActive: isActive !== false,
  });

  const populated = await product.populate('categories', 'groupName values');
  res.status(201).json({ success: true, message: 'Product created', data: populated });
};

// ─── PUT /api/tenant/products/:productId ──────────────────────────────────────
const updateProduct = async (req, res) => {
  const { productId } = req.params;
  const {
    name, nameVisible, description,
    deliveryEnabled, appointmentEnabled,
    deliveryPrice, appointmentPrice,
    categories, isActive, photos,
  } = req.body;

  const product = await Product.findOne({ _id: productId, tenantId: req.user.tenantId });
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  if (photos !== undefined) {
    const newPublicIds = new Set(
      (Array.isArray(photos) ? photos : []).map((p) => p.publicId).filter(Boolean)
    );
    const removedPhotos = product.photos.filter((p) => !newPublicIds.has(p.publicId));
    await deletePhotosFromCloudinary(removedPhotos);
    const cleanPhotos = (Array.isArray(photos) ? photos : []).filter((p) => p.url && p.publicId);
    if (cleanPhotos.length > 5) {
      return res.status(400).json({ success: false, message: 'Maximum 5 photos allowed per product' });
    }
    product.photos = cleanPhotos;
  }

  if (name !== undefined) {
    if (!name.trim()) return res.status(400).json({ success: false, message: 'Product name cannot be empty' });
    product.name = name.trim();
  }
  if (nameVisible !== undefined) product.nameVisible = nameVisible;
  if (description !== undefined) {
    product.description = typeof description === 'string' ? description.trim() : '';
  }
  if (isActive !== undefined) product.isActive = isActive;

  // ── Service enabled flags ─────────────────────────────────────────────────
  // Update enabled booleans first, then validate/update prices together.
  const newDeliveryEnabled = deliveryEnabled !== undefined ? deliveryEnabled === true : product.deliveryEnabled;
  const newAppointmentEnabled = appointmentEnabled !== undefined ? appointmentEnabled === true : product.appointmentEnabled;

  if (!newDeliveryEnabled && !newAppointmentEnabled) {
    return res.status(400).json({ success: false, message: 'At least one service (delivery or appointment) must be enabled' });
  }

  product.deliveryEnabled = newDeliveryEnabled;
  product.appointmentEnabled = newAppointmentEnabled;

  // ── Delivery price ────────────────────────────────────────────────────────
  if (!newDeliveryEnabled) {
    // Service turned off — clear price regardless of what was sent
    product.deliveryPrice = null;
  } else if (deliveryPrice !== undefined) {
    if (deliveryPrice === null || deliveryPrice === '') {
      return res.status(400).json({ success: false, message: 'Delivery price is required when delivery is enabled' });
    }
    if (Number(deliveryPrice) < 0) {
      return res.status(400).json({ success: false, message: 'Delivery price must be 0 or more' });
    }
    const newDelivery = Number(deliveryPrice);
    if (product.discount?.isActive) {
      product.discount.originalDeliveryPrice = newDelivery;
      product.deliveryPrice = product.discount.type === 'percentage'
        ? Math.round(newDelivery * (1 - product.discount.value / 100))
        : Math.max(0, newDelivery - product.discount.value);
    } else {
      product.deliveryPrice = newDelivery;
    }
  }

  // ── Appointment price ─────────────────────────────────────────────────────
  if (!newAppointmentEnabled) {
    // Service turned off — clear price regardless of what was sent
    product.appointmentPrice = null;
  } else if (appointmentPrice !== undefined) {
    if (appointmentPrice === null || appointmentPrice === '') {
      return res.status(400).json({ success: false, message: 'Appointment price is required when appointment is enabled' });
    }
    if (Number(appointmentPrice) < 0) {
      return res.status(400).json({ success: false, message: 'Appointment price must be 0 or more' });
    }
    const newAppt = Number(appointmentPrice);
    if (product.discount?.isActive) {
      product.discount.originalAppointmentPrice = newAppt;
      product.appointmentPrice = product.discount.type === 'percentage'
        ? Math.round(newAppt * (1 - product.discount.value / 100))
        : Math.max(0, newAppt - product.discount.value);
    } else {
      product.appointmentPrice = newAppt;
    }
  }

  if (categories !== undefined) {
    const catIds = Array.isArray(categories) ? categories : [];
    if (catIds.length > 0) {
      const valid = await validateCategoryOwnership(catIds, req.user.tenantId);
      if (!valid) {
        return res.status(400).json({ success: false, message: 'One or more categories are invalid' });
      }
    }
    product.categories = catIds;
  }

  await product.save();
  const populated = await product.populate('categories', 'groupName values');
  res.json({ success: true, message: 'Product updated', data: populated });
};

// ─── DELETE /api/tenant/products/:productId ───────────────────────────────────
const deleteProduct = async (req, res) => {
  const { productId } = req.params;
  const product = await Product.findOne({ _id: productId, tenantId: req.user.tenantId });
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  await deletePhotosFromCloudinary(product.photos);
  await product.deleteOne();
  res.json({ success: true, message: 'Product deleted' });
};

// ─── POST /api/tenant/products/:productId/discount ────────────────────────────
const applyDiscount = async (req, res) => {
  const { productId } = req.params;
  const { type, value, applyTo = 'both', startDate, endDate } = req.body;

  const product = await Product.findOne({ _id: productId, tenantId: req.user.tenantId });
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  if (!['percentage', 'fixed'].includes(type)) {
    return res.status(400).json({ success: false, message: 'Discount type must be percentage or fixed' });
  }
  if (!['both', 'delivery', 'appointment'].includes(applyTo)) {
    return res.status(400).json({ success: false, message: 'applyTo must be both, delivery, or appointment' });
  }
  const numValue = Number(value);
  if (!numValue || numValue <= 0) {
    return res.status(400).json({ success: false, message: 'Discount value must be greater than 0' });
  }
  if (type === 'percentage' && numValue >= 100) {
    return res.status(400).json({ success: false, message: 'Percentage discount must be between 1 and 99' });
  }
  if (type === 'fixed') {
    const checkDelivery = applyTo === 'both' || applyTo === 'delivery';
    const checkAppt = applyTo === 'both' || applyTo === 'appointment';
    if (
      (checkDelivery && numValue >= product.deliveryPrice) &&
      (checkAppt && numValue >= product.appointmentPrice)
    ) {
      return res.status(400).json({ success: false, message: 'Fixed discount cannot exceed the targeted price(s)' });
    }
    if (checkDelivery && !checkAppt && numValue >= product.deliveryPrice) {
      return res.status(400).json({ success: false, message: 'Fixed discount cannot exceed delivery price' });
    }
    if (checkAppt && !checkDelivery && numValue >= product.appointmentPrice) {
      return res.status(400).json({ success: false, message: 'Fixed discount cannot exceed appointment price' });
    }
  }
  if (endDate && new Date(endDate) <= new Date()) {
    return res.status(400).json({ success: false, message: 'End date must be in the future' });
  }
  if (endDate && startDate && new Date(endDate) <= new Date(startDate)) {
    return res.status(400).json({ success: false, message: 'End date must be after start date' });
  }

  const originalDeliveryPrice = product.deliveryPrice;
  const originalAppointmentPrice = product.appointmentPrice;
  const calcPrice = (orig) => {
    if (orig === null || orig === undefined) return orig;
    if (type === 'percentage') return Math.round(orig * (1 - numValue / 100));
    return Math.max(0, orig - numValue);
  };

  const newDeliveryPrice =
    applyTo === 'both' || applyTo === 'delivery'
      ? calcPrice(originalDeliveryPrice)
      : originalDeliveryPrice;
  const newAppointmentPrice =
    applyTo === 'both' || applyTo === 'appointment'
      ? calcPrice(originalAppointmentPrice)
      : originalAppointmentPrice;

  product.discount = {
    isActive: true,
    type,
    value: numValue,
    applyTo,
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,
    originalDeliveryPrice,
    originalAppointmentPrice,
  };
  product.deliveryPrice = newDeliveryPrice;
  product.appointmentPrice = newAppointmentPrice;

  await product.save();
  res.json({ success: true, message: 'Discount applied', data: product });
};

// ─── DELETE /api/tenant/products/:productId/discount ──────────────────────────
const removeDiscount = async (req, res) => {
  const { productId } = req.params;
  const product = await Product.findOne({ _id: productId, tenantId: req.user.tenantId });
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  if (!product.discount?.isActive) {
    return res.status(400).json({ success: false, message: 'No active discount on this product' });
  }

  // Restore original prices only for services that are still enabled
  if (product.deliveryEnabled) {
    product.deliveryPrice = product.discount.originalDeliveryPrice;
  }
  if (product.appointmentEnabled) {
    product.appointmentPrice = product.discount.originalAppointmentPrice;
  }

  product.discount = {
    isActive: false,
    type: null,
    value: null,
    applyTo: null,
    startDate: null,
    endDate: null,
    originalDeliveryPrice: null,
    originalAppointmentPrice: null,
  };

  await product.save();
  res.json({ success: true, message: 'Discount removed', data: product });
};

module.exports = { getProducts, createProduct, updateProduct, deleteProduct, applyDiscount, removeDiscount };