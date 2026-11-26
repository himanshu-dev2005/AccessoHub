const createMailHandler = require('@/controllers/middlewaresControllers/createMailHandler');
const { SendQuote } = require('@/emailTemplate/SendEmailTemplate');

module.exports = createMailHandler({
  modelName: 'Quote',
  label: 'Quote',
  templateBuilder: SendQuote,
});
