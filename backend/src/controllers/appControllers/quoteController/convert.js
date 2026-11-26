const mongoose = require('../../../db');
const { increaseBySettingKey, loadSettings } = require('../../../middlewares/settings');

const Quote = mongoose.model('Quote');
const Invoice = mongoose.model('Invoice');

const convert = async (req, res) => {
  const quote = await Quote.findOne({
    _id: req.params.id,
    removed: false,
  }).exec();

  if (!quote) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'Quote not found',
    });
  }

  if (quote.converted) {
    return res.status(409).json({
      success: false,
      result: null,
      message: 'Quote has already been converted to an invoice',
    });
  }

  const settings = await loadSettings();
  const nextNumber = (Number(settings['last_invoice_number']) || 0) + 1;

  const invoicePayload = {
    createdBy: req.admin._id,
    number: nextNumber,
    year: new Date().getFullYear(),
    date: new Date(),
    expiredDate: quote.expiredDate,
    client: quote.client._id || quote.client,
    converted: {
      from: 'quote',
      quote: quote._id,
    },
    items: quote.items.map((item) => ({
      itemName: item.itemName,
      description: item.description,
      quantity: item.quantity,
      price: item.price,
      total: item.total,
    })),
    taxRate: quote.taxRate,
    subTotal: quote.subTotal,
    taxTotal: quote.taxTotal,
    total: quote.total,
    currency: quote.currency || settings['default_currency_code'] || 'INR',
    discount: quote.discount || 0,
    notes: quote.notes,
    status: 'pending',
    paymentStatus: 'unpaid',
  };

  const invoice = await new Invoice(invoicePayload).save();
  const fileId = 'invoice-' + invoice._id + '.pdf';
  const updatedInvoice = await Invoice.findOneAndUpdate(
    { _id: invoice._id },
    { pdf: fileId },
    { new: true }
  ).exec();

  await Quote.findOneAndUpdate(
    { _id: quote._id },
    { converted: true, status: 'accepted', approved: true }
  ).exec();

  await increaseBySettingKey({ settingKey: 'last_invoice_number' });

  return res.status(200).json({
    success: true,
    result: updatedInvoice,
    message: 'Quote converted to invoice successfully',
  });
};

module.exports = convert;
