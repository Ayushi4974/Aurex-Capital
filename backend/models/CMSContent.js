const mongoose = require('mongoose');

const cmsContentSchema = new mongoose.Schema({
  type: { type: String, enum: ['banner', 'news', 'faq', 'announcement'], required: true },
  title: { type: String, required: true },
  content: { type: String, default: '' },
  image: { type: String, default: '' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  priority: { type: Number, default: 0 },
  expiresAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('CMSContent', cmsContentSchema);
