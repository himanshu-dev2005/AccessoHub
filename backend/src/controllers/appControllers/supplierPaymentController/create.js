const mongoose = require('../../../db');
const { calculate } = require('../../../helpers');
const { loadSettings } = require('../../../middlewares/settings');

const Model = mongoose.model('SupplierPayment');
const SupplierPurchase = mongoose.model('SupplierPurchase');

const create = async (req, res) => {
  const body = { ...req.body, removed: false };
  const amount = Number(body.amount) || 0;

  if (amount <= 0) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'Payment amount must be greater than 0',
    });
  }

  if (body.supplierPurchase) {
    const purchase = await SupplierPurchase.findOne({
      _id: body.supplierPurchase,
      removed: false,
    }).exec();

    if (!purchase) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Linked supplier purchase not found',
      });
    }

    const maxPayable = calculate.sub(purchase.total || 0, purchase.paidAmount || 0);
    if (amount > maxPayable && maxPayable > 0) {
      return res.status(400).json({
        success: false,
        result: null,
        message: `Maximum payable balance for this purchase is ${maxPayable}`,
      });
    }

    if (!body.supplier) {
      body.supplier = purchase.supplier?._id || purchase.supplier;
    }

    const newPaid = calculate.add(purchase.paidAmount || 0, amount);
    const paymentStatus =
      newPaid >= (purchase.total || 0) ? 'paid' : newPaid > 0 ? 'partially' : 'unpaid';

    await SupplierPurchase.findByIdAndUpdate(purchase._id, {
      $set: {
        paidAmount: newPaid,
        paymentStatus,
        updated: new Date(),
      },
    }).exec();
  }

  if (!body.currency) {
    const settings = await loadSettings();
    body.currency = settings['default_currency_code'] || 'INR';
  }

  body.createdBy = req.admin._id;

  const created = await new Model(body).save();
  const result = await Model.findById(created._id).exec();

  return res.status(200).json({
    success: true,
    result,
    message: 'Supplier payment recorded successfully',
  });
};

module.exports = create;
