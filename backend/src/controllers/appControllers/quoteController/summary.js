const mongoose = require('mongoose');

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

  const response = await Model.aggregate([
    {
      $match: {
        removed: false,
      },
    },
    {
      $facet: {
        totalQuote: [
          {
            $group: {
              _id: null,
              total: { $sum: '$total' },
              count: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              total: '$total',
              count: '$count',
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
          {
            $project: {
              _id: 0,
              status: '$_id',
              count: '$count',
            },
          },
        ],
      },
    },
  ]);

  const totalQuotes = response[0].totalQuote[0] || { total: 0, count: 0 };
  const statusResult = response[0].statusCounts || [];

  const result = [];
  const totalCount = totalQuotes.count || 0;

  statuses.forEach((status) => {
    const found = statusResult.find((item) => item.status === status);
    if (found && totalCount > 0) {
      result.push({
        status: found.status,
        count: found.count,
        percentage: Math.round((found.count / totalCount) * 100),
      });
    }
  });

  return res.status(200).json({
    success: true,
    result: {
      total: totalQuotes.total || 0,
      type: defaultType,
      performance: result,
    },
    message: `Successfully found all quotes for the last ${defaultType}`,
  });
};

module.exports = summary;
