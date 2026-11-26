const createCRUDController = require('../../middlewaresControllers/createCRUDController');
const methods = createCRUDController('SupplierPayment');

const create = require('./create');
const remove = require('./remove');
const summary = require('./summary');
const bulkCreate = require('./bulkCreate');

methods.create = create;
methods.delete = remove;
methods.summary = summary;
methods.bulkCreate = bulkCreate;

module.exports = methods;
