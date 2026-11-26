const mongoose = require('mongoose');

const Model = mongoose.model('Quote');

const { calculate } = require('@/helpers');
const { increaseBySettingKey, loadSettings } = require('@/middlewares/settings');
const schema = require('./schemaValidate');

const create = async (req, res) => {
  let body = req.body;

  const { error, value } = schema.validate(body);
  if (error) {
    const { details } = error;
    return res.status(400).json({
      success: false,
      result: null,
      message: details[0]?.message,
    });
  }

  const { items = [], taxRate = 0 } = value;

  let subTotal = 0;
  items.forEach((item) => {
    const itemTotal = calculate.multiply(item['quantity'], item['price']);
    subTotal = calculate.add(subTotal, itemTotal);
    item['total'] = itemTotal;
  });

  const taxTotal = calculate.multiply(subTotal, Number(taxRate) / 100);
  const total = calculate.add(subTotal, taxTotal);

  if (!body.currency) {
    const settings = await loadSettings();
    body['currency'] = settings['default_currency_code'] || 'INR';
  }

  body['subTotal'] = subTotal;
  body['taxTotal'] = taxTotal;
  body['total'] = total;
  body['items'] = items;
  body['createdBy'] = req.admin._id;

  const result = await new Model(body).save();
  const fileId = 'quote-' + result._id + '.pdf';
  const updateResult = await Model.findOneAndUpdate(
    { _id: result._id },
    { pdf: fileId },
    { new: true }
  ).exec();

  increaseBySettingKey({
    settingKey: 'last_quote_number',
  });

  return res.status(200).json({
    success: true,
    result: updateResult,
    message: 'Quote created successfully',
  });
};

module.exports = create;
