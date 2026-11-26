const mongoose = require('@/db');
const { loadSettings } = require('@/middlewares/settings');

const Model = mongoose.model('Payment');

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

  const payments = await Model.find({ removed: false }).skipPopulate().exec();
  const count = payments.length;
  const total = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return res.status(200).json({
    success: true,
    result: { count, total },
    message: `Successfully fetched the summary of payment invoices for the last ${defaultType}`,
  });
};

module.exports = summary;
