const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: function() { return this.auth_provider === 'local'; },
  },
  cpse_organization: {
    type: String,
    default: 'ONGC',
  },
  designation: {
    type: String,
    default: 'Materials & Procurement Officer',
  },
  auth_provider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },
  avatar: {
    type: String,
    default: '',
  },
  created_at: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('User', userSchema);
