const appModelNames = [
  'Client',
  'Invoice',
  'Payment',
  'PaymentMode',
  'Product',
  'ProductCategory',
  'Quote',
  'Supplier',
  'SupplierPayment',
  'SupplierPurchase',
  'Task',
  'Taxes',
];

const coreModelNames = ['Admin', 'AdminPassword', 'Setting', 'Upload'];

const modelsFiles = [...coreModelNames, ...appModelNames];

const constrollersList = [];
const appModelsList = [];
const entityList = [];
const routesList = [];

for (const fileNameWithoutExtension of appModelNames) {
  const firstChar = fileNameWithoutExtension.charAt(0);
  const modelName = fileNameWithoutExtension.replace(firstChar, firstChar.toUpperCase());
  const fileNameLowerCaseFirstChar = fileNameWithoutExtension.replace(
    firstChar,
    firstChar.toLowerCase()
  );
  const entity = fileNameWithoutExtension.toLowerCase();

  const controllerName = fileNameLowerCaseFirstChar + 'Controller';
  constrollersList.push(controllerName);
  appModelsList.push(modelName);
  entityList.push(entity);

  routesList.push({
    entity,
    modelName,
    controllerName,
  });
}

module.exports = { constrollersList, appModelsList, modelsFiles, entityList, routesList };
