const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    title: { type: String, required: [true, 'Title is required'], trim: true },
    content: { type: String, required: [true, 'Content is required'] }, // rich text (HTML)
    publishDate: { type: Date, default: Date.now },
    isPublished: { type: Boolean, default: true },
    seo: {
      metaTitle: { type: String },
      metaDescription: { type: String },
      slug: { type: String, required: true },
    },
  },
  { timestamps: true }
);

// Enforce unique slug per tenant
blogPostSchema.index({ tenantId: 1, 'seo.slug': 1 }, { unique: true });

const BlogPost = mongoose.model('BlogPost', blogPostSchema);
module.exports = BlogPost;
