const mongoose = require('../../../db');

const Model = mongoose.model('SupplierPayment');

const summary = async (req, res) => {
  const payments = await Model.find({ removed: false }).skipPopulate().exec();
  const count = payments.length;
  const total = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return res.status(200).json({
    success: true,
    result: { count, total },
    message: 'Successfully fetched supplier payment summary',
  });
};

module.exports = summary;
