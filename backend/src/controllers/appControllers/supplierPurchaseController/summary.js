const mongoose = require('../../../db');

const Model = mongoose.model('SupplierPurchase');

const summary = async (req, res) => {
  const statuses = ['draft', 'ordered', 'received', 'cancelled'];
  const purchases = await Model.find({ removed: false }).skipPopulate().exec();

  const count = purchases.length;
  let total = 0;
  let paid = 0;
  const statusCounts = {};

  for (const item of purchases) {
    total += Number(item.total || 0);
    paid += Number(item.paidAmount || 0);
    if (item.status) {
      statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
    }
  }

  const performance = statuses.map((status) => {
    const statusCount = statusCounts[status] || 0;
    return {
      status,
      count: statusCount,
      percentage: count > 0 ? Math.round((statusCount / count) * 100) : 0,
    };
  });

  const totalDue = Math.max(0, total - paid);

  return res.status(200).json({
    success: true,
    result: {
      count,
      total,
      paid,
      total_due: totalDue,
      performance,
    },
    message: 'Successfully fetched supplier purchase summary',
  });
};

module.exports = summary;
