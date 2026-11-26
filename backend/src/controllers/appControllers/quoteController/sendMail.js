const createMailHandler = require('../../middlewaresControllers/createMailHandler');
const { SendQuote } = require('../../../emailTemplate/SendEmailTemplate');

module.exports = createMailHandler({
  modelName: 'Quote',
  label: 'Quote',
  templateBuilder: SendQuote,
});
