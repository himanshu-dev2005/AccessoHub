const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const methods = createCRUDController('SupplierPurchase');

const create = require('./create');
const update = require('./update');
const summary = require('./summary');
const bulkCreate = require('./bulkCreate');

methods.create = create;
methods.update = update;
methods.summary = summary;
methods.bulkCreate = bulkCreate;

module.exports = methods;
