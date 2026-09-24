const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  material_a: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true,
  },
  material_b: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true,
  },
  match_score: {
    type: Number,
    min: 0,
    max: 100,
  },
  match_type: {
    type: String,
    enum: ['identical', 'near-duplicate', 'equivalent', 'different'],
  },
  field_comparison: {
    type: Object,
  },
  ai_reasoning: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'endorsed', 'approved', 'rejected'],
    default: 'pending',
  },
  technical_endorsement: {
    endorsed_by: { type: String },
    cpse: { type: String },
    designation: { type: String },
    endorsed_at: { type: Date },
    notes: { type: String }
  },
  suggested_national_code: {
    type: String,
  },
  reviewed_by: {
    type: String,
  },
  reviewed_at: {
    type: Date,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Match', MatchSchema);
