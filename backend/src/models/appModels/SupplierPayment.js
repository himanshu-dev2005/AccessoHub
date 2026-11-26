const mongoose = require('mongoose');

const supplierPaymentSchema = new mongoose.Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  number: {
    type: String,
    required: true,
    trim: true,
  },
  supplier: {
    type: mongoose.Schema.ObjectId,
    ref: 'Supplier',
    required: true,
    autopopulate: true,
  },
  supplierPurchase: {
    type: mongoose.Schema.ObjectId,
    ref: 'SupplierPurchase',
    autopopulate: true,
  },
  paymentMode: {
    type: mongoose.Schema.ObjectId,
    ref: 'PaymentMode',
    autopopulate: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01,
  },
  currency: {
    type: String,
    default: 'INR',
    uppercase: true,
  },
  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
  ref: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
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

supplierPaymentSchema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model('SupplierPayment', supplierPaymentSchema);
