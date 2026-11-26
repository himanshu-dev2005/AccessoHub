const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const methods = createCRUDController('Product');

const summary = require('./summary');
const bulkCreate = require('./bulkCreate');

methods.summary = summary;
methods.bulkCreate = bulkCreate;

module.exports = methods;
