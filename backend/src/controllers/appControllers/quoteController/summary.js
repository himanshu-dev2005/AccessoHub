const mongoose = require('../../../db');

const Model = mongoose.model('Quote');

const summary = async (req, res) => {
  let defaultType = 'month';
  const { type } = req.query;

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

  const statuses = ['draft', 'pending', 'sent', 'accepted', 'declined', 'expired'];
  const quotes = await Model.find({ removed: false }).skipPopulate().exec();

  const totalCount = quotes.length;
  let totalAmount = 0;
  const statusCounts = {};

  for (const quote of quotes) {
    totalAmount += Number(quote.total || 0);
    if (quote.status) {
      statusCounts[quote.status] = (statusCounts[quote.status] || 0) + 1;
    }
  }

  const result = [];
  statuses.forEach((status) => {
    const count = statusCounts[status] || 0;
    if (count > 0 && totalCount > 0) {
      result.push({
        status,
        count,
        percentage: Math.round((count / totalCount) * 100),
      });
    }
  });

  return res.status(200).json({
    success: true,
    result: {
      total: totalAmount,
      type: defaultType,
      performance: result,
    },
    message: `Successfully found all quotes for the last ${defaultType}`,
  });
};

module.exports = summary;
