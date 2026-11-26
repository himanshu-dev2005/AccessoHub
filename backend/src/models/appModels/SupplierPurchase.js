const mongoose = require('../../db');

const supplierPurchaseSchema = new mongoose.Schema({
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
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    autopopulate: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  taxRate: {
    type: Number,
    default: 0,
    min: 0,
  },
  subTotal: {
    type: Number,
    default: 0,
  },
  taxTotal: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    default: 0,
  },
  paidAmount: {
    type: Number,
    default: 0,
  },
  currency: {
    type: String,
    default: 'INR',
    uppercase: true,
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
  expectedDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['draft', 'ordered', 'received', 'cancelled'],
    default: 'ordered',
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partially', 'paid'],
    default: 'unpaid',
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


module.exports = mongoose.model('SupplierPurchase', supplierPurchaseSchema);
