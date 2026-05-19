const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
  isActive: { type: Boolean, default: false },
  type: { type: String, enum: ['percentage', 'fixed'] },
  value: { type: Number },
  startDate: { type: Date },
  endDate: { type: Date },
  originalDeliveryPrice: { type: Number, default: null },
  originalAppointmentPrice: { type: Number, default: null },
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
    // Whether this product offers delivery / appointment at all.
    // These are the authoritative on/off flags — price fields alone are not
    // reliable because Mongoose can coerce null/undefined to 0 during populate.
    deliveryEnabled: { type: Boolean, default: true },
    appointmentEnabled: { type: Boolean, default: true },
    // null means "not applicable" but deliveryEnabled/appointmentEnabled is the
    // real gate; price is only read when the corresponding enabled flag is true.
    deliveryPrice: {
      type: Number,
      default: null,
      set: (v) => (v === null || v === undefined || v === '') ? null : Number(v),
    },
    appointmentPrice: {
      type: Number,
      default: null,
      set: (v) => (v === null || v === undefined || v === '') ? null : Number(v),
    },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    discount: { type: discountSchema, default: () => ({}) },
  },
  { timestamps: true, strict: true }
);

productSchema.index({ tenantId: 1, isActive: 1 });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;