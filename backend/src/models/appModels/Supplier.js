const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
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
  phone: String,
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  gstNumber: {
    type: String,
    trim: true,
  },
  country: String,
  address: String,
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  notes: String,
  createdBy: { type: mongoose.Schema.ObjectId, ref: 'Admin' },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
});

supplierSchema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model('Supplier', supplierSchema);
