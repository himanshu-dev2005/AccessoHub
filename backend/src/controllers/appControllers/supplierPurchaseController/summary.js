const mongoose = require('mongoose');

const Model = mongoose.model('SupplierPurchase');

const summary = async (req, res) => {
  const statuses = ['draft', 'ordered', 'received', 'cancelled'];

  const response = await Model.aggregate([
    { $match: { removed: false } },
    {
      $facet: {
        totals: [
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              total: { $sum: '$total' },
              paid: { $sum: '$paidAmount' },
            },
          },
        ],
        statusCounts: [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
        ],
      },
    },
  ]);

  const totals = response[0].totals[0] || { count: 0, total: 0, paid: 0 };
  const statusCounts = response[0].statusCounts || [];

  const performance = statuses.map((status) => {
    const found = statusCounts.find((s) => s._id === status);
    const count = found ? found.count : 0;
    return {
      status,
      count,
      percentage: totals.count > 0 ? Math.round((count / totals.count) * 100) : 0,
    };
  });

  const totalDue = Math.max(0, (totals.total || 0) - (totals.paid || 0));

  return res.status(200).json({
    success: true,
    result: {
      count: totals.count,
      total: totals.total,
      paid: totals.paid,
      total_due: totalDue,
      performance,
    },
    message: 'Successfully fetched supplier purchase summary',
  });
};

module.exports = summary;
