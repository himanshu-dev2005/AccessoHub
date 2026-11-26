const mongoose = require('@/db');
const { calculate } = require('@/helpers');

const Model = mongoose.model('SupplierPurchase');
const Product = mongoose.model('Product');

const update = async (req, res) => {
  const existing = await Model.findOne({ _id: req.params.id, removed: false }).exec();
  if (!existing) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'Supplier purchase not found',
    });
  }

  const body = { ...req.body, removed: false, updated: new Date() };
  const quantity = Number(body.quantity ?? existing.quantity) || 1;
  const unitPrice = Number(body.unitPrice ?? existing.unitPrice) || 0;
  const taxRate = Number(body.taxRate ?? existing.taxRate) || 0;

  const subTotal = calculate.multiply(quantity, unitPrice);
  const taxTotal = calculate.multiply(subTotal, taxRate / 100);
  const total = calculate.add(subTotal, taxTotal);

  body.subTotal = subTotal;
  body.taxTotal = taxTotal;
  body.total = total;

  const paidAmount = Number(body.paidAmount ?? existing.paidAmount) || 0;
  body.paymentStatus =
    paidAmount >= total && total > 0 ? 'paid' : paidAmount > 0 ? 'partially' : 'unpaid';

  const result = await Model.findOneAndUpdate(
    { _id: req.params.id, removed: false },
    body,
    { new: true, runValidators: true }
  ).exec();

  if (existing.status !== 'received' && result.status === 'received' && result.product) {
    const productId = result.product._id || result.product;
    await Product.findByIdAndUpdate(productId, {
      $inc: { stock: quantity },
      $set: { updated: new Date() },
    }).exec();
  }

  return res.status(200).json({
    success: true,
    result,
    message: 'Supplier purchase updated successfully',
  });
};

module.exports = update;
