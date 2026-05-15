const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    groupName: {
      type: String,
      required: [true, 'Category group name is required'],
      trim: true,
    },
    values: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { timestamps: true }
);

categorySchema.index({ tenantId: 1, groupName: 1 });

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
