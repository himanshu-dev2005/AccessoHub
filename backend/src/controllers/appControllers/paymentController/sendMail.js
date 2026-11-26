const createMailHandler = require('@/controllers/middlewaresControllers/createMailHandler');
const { SendPaymentReceipt } = require('@/emailTemplate/SendEmailTemplate');

module.exports = createMailHandler({
  modelName: 'Payment',
  label: 'Payment Receipt',
  templateBuilder: SendPaymentReceipt,
});
