const mongoose = require('@/db');
const { calculate } = require('@/helpers');

const Model = mongoose.model('SupplierPayment');
const SupplierPurchase = mongoose.model('SupplierPurchase');

const remove = async (req, res) => {
  const payment = await Model.findOneAndUpdate(
    { _id: req.params.id, removed: false },
    { $set: { removed: true, updated: new Date() } },
    { new: true }
  ).exec();

  if (!payment) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'Supplier payment not found',
    });
  }

  if (payment.supplierPurchase) {
    const purchaseId = payment.supplierPurchase._id || payment.supplierPurchase;
    const purchase = await SupplierPurchase.findById(purchaseId).exec();
    if (purchase) {
      const nextPaid = Math.max(0, calculate.sub(purchase.paidAmount || 0, payment.amount || 0));
      const paymentStatus =
        nextPaid >= (purchase.total || 0) && (purchase.total || 0) > 0
          ? 'paid'
          : nextPaid > 0
          ? 'partially'
          : 'unpaid';

      await SupplierPurchase.findByIdAndUpdate(purchaseId, {
        $set: { paidAmount: nextPaid, paymentStatus, updated: new Date() },
      }).exec();
    }
  }

  return res.status(200).json({
    success: true,
    result: payment,
    message: 'Supplier payment deleted successfully',
  });
};

module.exports = remove;
