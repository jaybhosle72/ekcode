const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
  },
  entity_type: {
    type: String,
  },
  entity_id: {
    type: mongoose.Schema.Types.ObjectId,
  },
  details: {
    type: String,
  },
  user: {
    type: String,
    default: 'Admin',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
