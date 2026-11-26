const createCRUDController = require('../../middlewaresControllers/createCRUDController');
const methods = createCRUDController('Task');

const summary = require('./summary');

methods.summary = summary;

module.exports = methods;
