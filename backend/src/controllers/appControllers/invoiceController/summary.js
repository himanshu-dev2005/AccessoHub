const mongoose = require('@/db');
const { loadSettings } = require('@/middlewares/settings');

const Model = mongoose.model('Invoice');

const summary = async (req, res) => {
  let defaultType = 'month';
  const { type } = req.query;

  await loadSettings();

  if (type) {
    if (['week', 'month', 'year'].includes(type)) {
      defaultType = type;
    } else {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Invalid type',
      });
    }
  }

  const statuses = ['draft', 'pending', 'overdue', 'paid', 'unpaid', 'partially'];
  const invoices = await Model.find({ removed: false }).skipPopulate().exec();

  const totalCount = invoices.length;
  let totalAmount = 0;
  let totalUndue = 0;
  let overdueCount = 0;

  const statusCounts = {};
  const paymentStatusCounts = {};
  const now = new Date();

  for (const inv of invoices) {
    const invTotal = Number(inv.total || 0);
    const invCredit = Number(inv.credit || 0);
    totalAmount += invTotal;

    if (inv.status) {
      statusCounts[inv.status] = (statusCounts[inv.status] || 0) + 1;
    }
    if (inv.paymentStatus) {
      paymentStatusCounts[inv.paymentStatus] = (paymentStatusCounts[inv.paymentStatus] || 0) + 1;
    }
    if (inv.expiredDate && new Date(inv.expiredDate) < now) {
      overdueCount += 1;
    }
    if (inv.paymentStatus === 'unpaid' || inv.paymentStatus === 'partially') {
      totalUndue += invTotal - invCredit;
    }
  }

  const combined = [];
  for (const [status, count] of Object.entries(paymentStatusCounts)) {
    combined.push({
      status,
      count,
      percentage: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
    });
  }
  for (const [status, count] of Object.entries(statusCounts)) {
    combined.push({
      status,
      count,
      percentage: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
    });
  }
  if (overdueCount > 0 && totalCount > 0) {
    combined.push({
      status: 'overdue',
      count: overdueCount,
      percentage: Math.round((overdueCount / totalCount) * 100),
    });
  }

  const result = [];
  statuses.forEach((status) => {
    const found = combined.find((item) => item.status === status);
    if (found) result.push(found);
  });

  return res.status(200).json({
    success: true,
    result: {
      total: totalAmount,
      total_undue: totalUndue,
      type,
      performance: result,
    },
    message: `Successfully found all invoices for the last ${defaultType}`,
  });
};

module.exports = summary;
