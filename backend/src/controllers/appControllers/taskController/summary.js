const mongoose = require('mongoose');

const Model = mongoose.model('Task');

const summary = async (req, res) => {
  const [total, pending, inProgress, completed, overdue] = await Promise.all([
    Model.countDocuments({ removed: false }),
    Model.countDocuments({ removed: false, status: 'pending' }),
    Model.countDocuments({ removed: false, status: 'in_progress' }),
    Model.countDocuments({ removed: false, status: 'completed' }),
    Model.countDocuments({
      removed: false,
      status: { $in: ['pending', 'in_progress'] },
      dueDate: { $lt: new Date() },
    }),
  ]);

  return res.status(200).json({
    success: true,
    result: {
      total,
      pending,
      in_progress: inProgress,
      completed,
      overdue,
    },
    message: 'Successfully fetched task summary',
  });
};

module.exports = summary;
