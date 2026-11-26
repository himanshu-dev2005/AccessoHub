const mongoose = require('mongoose');

const Model = mongoose.model('Product');

const summary = async (req, res) => {
  const response = await Model.aggregate([
    { $match: { removed: false } },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        totalStock: { $sum: '$stock' },
        inventoryValue: {
          $sum: {
            $multiply: [{ $ifNull: ['$retailPrice', '$price'] }, '$stock'],
          },
        },
        lowStockCount: {
          $sum: { $cond: [{ $lte: ['$stock', 5] }, 1, 0] },
        },
      },
    },
  ]);

  const stats = response[0] || {
    count: 0,
    totalStock: 0,
    inventoryValue: 0,
    lowStockCount: 0,
  };

  return res.status(200).json({
    success: true,
    result: {
      count: stats.count,
      totalStock: stats.totalStock,
      total: stats.inventoryValue,
      lowStock: stats.lowStockCount,
    },
    message: 'Successfully fetched product summary',
  });
};

module.exports = summary;
