const mongoose = require('mongoose');

const Model = mongoose.model('SupplierPayment');

const summary = async (req, res) => {
  const response = await Model.aggregate([
    { $match: { removed: false } },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        total: { $sum: '$amount' },
      },
    },
    {
      $project: {
        _id: 0,
        count: 1,
        total: 1,
      },
    },
  ]);

  return res.status(200).json({
    success: true,
    result: response[0] || { count: 0, total: 0 },
    message: 'Successfully fetched supplier payment summary',
  });
};

module.exports = summary;
