const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
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
  ref: {
    type: String,
    trim: true,
  },
  productCategory: {
    type: mongoose.Schema.ObjectId,
    ref: 'ProductCategory',
    autopopulate: true,
  },
  retailPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  wholesalePrice: {
    type: Number,
    required: true,
    default: 0,
  },
  purchaseCost: {
    type: Number,
    required: true,
    default: 0,
  },
  price: {
    type: Number,
    default: 0,
  },
  costPrice: {
    type: Number,
    default: 0,
  },
  stock: {
    type: Number,
    default: 0,
  },
  currency: {
    type: String,
    default: 'INR',
    uppercase: true,
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

productSchema.pre('save', function (next) {
  if (this.retailPrice === undefined || this.retailPrice === null) {
    this.retailPrice = this.price || 0;
  }
  this.price = this.retailPrice;
  if (this.purchaseCost === undefined || this.purchaseCost === null) {
    this.purchaseCost = this.costPrice || 0;
  }
  this.costPrice = this.purchaseCost;
  this.updated = Date.now();
  next();
});

productSchema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model('Product', productSchema);
