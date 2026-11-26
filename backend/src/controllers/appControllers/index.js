const createCRUDController = require('../middlewaresControllers/createCRUDController');
const { routesList } = require('../../models/utils');

const customControllers = {
  clientController: require('./clientController'),
  invoiceController: require('./invoiceController'),
  paymentController: require('./paymentController'),
  productController: require('./productController'),
  quoteController: require('./quoteController'),
  supplierPaymentController: require('./supplierPaymentController'),
  supplierPurchaseController: require('./supplierPurchaseController'),
  taskController: require('./taskController'),
};

const appControllers = () => {
  const controllers = { ...customControllers };

  routesList.forEach(({ modelName, controllerName }) => {
    if (!controllers[controllerName]) {
      controllers[controllerName] = createCRUDController(modelName);
    }
  });

  return controllers;
};

module.exports = appControllers();
