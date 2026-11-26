const createMailHandler = require('@/controllers/middlewaresControllers/createMailHandler');
const { SendInvoice } = require('@/emailTemplate/SendEmailTemplate');

module.exports = createMailHandler({
  modelName: 'Invoice',
  label: 'Invoice',
  templateBuilder: SendInvoice,
});
