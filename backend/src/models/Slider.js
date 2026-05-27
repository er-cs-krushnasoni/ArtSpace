const mongoose = require('mongoose');

const sliderSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    order: { type: Number, default: 0 },
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String },
    title: { type: String, trim: true },
    linkType: {
      type: String,
      enum: ['product', 'category', 'none'],
      default: 'none',
    },
    linkId: { type: mongoose.Schema.Types.ObjectId },
    linkValue: { type: String, default: null },   
  },
  { timestamps: true }
);

sliderSchema.index({ tenantId: 1, order: 1 });

const Slider = mongoose.model('Slider', sliderSchema);
module.exports = Slider;
