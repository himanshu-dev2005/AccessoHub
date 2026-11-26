const mongoose = require('mongoose');
const { calculate } = require('@/helpers');
const { loadSettings } = require('@/middlewares/settings');

const Model = mongoose.model('SupplierPurchase');
const Product = mongoose.model('Product');

const computePurchaseTotals = (body) => {
  const quantity = Number(body.quantity) || 1;
  const unitPrice = Number(body.unitPrice) || 0;
  const taxRate = Number(body.taxRate) || 0;

  const subTotal = calculate.multiply(quantity, unitPrice);
  const taxTotal = calculate.multiply(subTotal, taxRate / 100);
  const total = calculate.add(subTotal, taxTotal);

  return { quantity, unitPrice, taxRate, subTotal, taxTotal, total };
};

const create = async (req, res) => {
  const body = { ...req.body, removed: false };
  const totals = computePurchaseTotals(body);

  Object.assign(body, totals);
  body.createdBy = req.admin._id;

  if (!body.currency) {
    const settings = await loadSettings();
    body.currency = settings['default_currency_code'] || 'INR';
  }

  const paidAmount = Number(body.paidAmount) || 0;
  body.paidAmount = paidAmount;
  body.paymentStatus =
    paidAmount >= totals.total && totals.total > 0
      ? 'paid'
      : paidAmount > 0
      ? 'partially'
      : 'unpaid';

  const result = await new Model(body).save();

  if (body.status === 'received' && body.product) {
    await Product.findByIdAndUpdate(body.product, {
      $inc: { stock: totals.quantity },
      $set: { updated: new Date() },
    }).exec();
  }

  const populated = await Model.findById(result._id).exec();

  return res.status(200).json({
    success: true,
    result: populated,
    message: 'Supplier purchase created successfully',
  });
};

module.exports = create;
