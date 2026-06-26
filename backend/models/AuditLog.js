const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  adminId: { type: String, required: true },
  userId: { type: String, default: '' },
  action: { type: String, required: true },
  module: { type: String, required: true },
  before: { type: mongoose.Schema.Types.Mixed, default: {} },
  after: { type: mongoose.Schema.Types.Mixed, default: {} },
  ip: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
