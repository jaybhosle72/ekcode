const mongoose = require('mongoose');

const UnifiedMaterialSchema = new mongoose.Schema({
  national_code: {
    type: String,
    required: true,
    unique: true,
  },
  standard_description: {
    type: String,
  },
  category: {
    type: String,
  },
  mapped_codes: [{
    cpse: String,
    code: String,
    material_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material',
    }
  }],
  total_annual_quantity: {
    type: Number,
    default: 0,
  },
  estimated_savings: {
    type: Number,
    default: 0,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('UnifiedMaterial', UnifiedMaterialSchema);

