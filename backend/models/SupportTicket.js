const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const supportTicketSchema = new mongoose.Schema({
  ticketId: { type: String, unique: true, default: () => `TKT_${uuidv4().split('-')[0].toUpperCase()}` },
  userId: { type: String, required: true, index: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  status: { type: String, enum: ['open', 'in-progress', 'resolved', 'closed'], default: 'open' },
  assignedTo: { type: String, default: '' },
  messages: [{
    sender: { type: String },
    message: { type: String },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
