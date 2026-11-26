const mongoose = require('../../db');

const schema = new mongoose.Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  enabled: {
    type: Boolean,
    default: true,
  },

  name: {
    type: String,
    required: true,
    trim: true,
  },
  company: {
    type: String,
    trim: true,
  },
  industry: {
    type: String,
    trim: true,
  },
  website: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['active', 'new', 'premium', 'inactive'],
    default: 'active',
  },
  category: {
    type: String,
    enum: ['wholesale', 'retail'],
    default: 'retail',
  },
  source: {
    type: String,
    trim: true,
  },
  phone: String,
  country: String,
  address: String,
  email: String,
  notes: String,
  createdBy: { type: mongoose.Schema.ObjectId, ref: 'Admin' },
  assigned: { type: mongoose.Schema.ObjectId, ref: 'Admin' },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
});


module.exports = mongoose.model('Client', schema);
