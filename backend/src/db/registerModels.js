let registered = false;

function registerModels() {
  if (registered) return;

  // Core models
  require('../models/coreModels/Admin');
  require('../models/coreModels/AdminPassword');
  require('../models/coreModels/Setting');
  require('../models/coreModels/Upload');

  // App models
  require('../models/appModels/Client');
  require('../models/appModels/Invoice');
  require('../models/appModels/Payment');
  require('../models/appModels/PaymentMode');
  require('../models/appModels/Product');
  require('../models/appModels/ProductCategory');
  require('../models/appModels/Quote');
  require('../models/appModels/Supplier');
  require('../models/appModels/SupplierPayment');
  require('../models/appModels/SupplierPurchase');
  require('../models/appModels/Task');
  require('../models/appModels/Taxes');

  registered = true;
}

module.exports = registerModels;
