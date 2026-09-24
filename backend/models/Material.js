const mongoose = require('mongoose');

const MaterialSchema = new mongoose.Schema({
  cpse_name: {
    type: String,
    required: true,
  },
  original_code: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
  },
  specifications: {
    type: Object,
  },
  unit_of_measure: {
    type: String,
  },
  unit_price: {
    type: Number,
  },
  annual_quantity: {
    type: Number,
  },
  data_quality_flags: [String],
  uploaded_at: {
    type: Date,
    default: Date.now,
  },
});

MaterialSchema.index({ description: 'text' });

module.exports = mongoose.model('Material', MaterialSchema);
