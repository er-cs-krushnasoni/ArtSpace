const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
  isActive: { type: Boolean, default: false },
  type: { type: String, enum: ['percentage', 'fixed'] },
  value: { type: Number },
  startDate: { type: Date },
  endDate: { type: Date },
  originalDeliveryPrice: { type: Number },
  originalAppointmentPrice: { type: Number },
});

const productSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true },
    nameVisible: { type: Boolean, default: true },
    photos: [
      {
        url: { type: String },
        publicId: { type: String },
      },
    ],
    deliveryPrice: { type: Number, default: 0 },
    appointmentPrice: { type: Number, default: 0 },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
description: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
        discount: { type: discountSchema, default: () => ({}) },
  },
  { timestamps: true }
);

productSchema.index({ tenantId: 1, isActive: 1 });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
