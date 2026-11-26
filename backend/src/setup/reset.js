require('module-alias/register');
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

const db = require('../db');
db.connect();

async function deleteData() {
  const Admin = require('../models/coreModels/Admin');
  const AdminPassword = require('../models/coreModels/AdminPassword');
  const Setting = require('../models/coreModels/Setting');
  const PaymentMode = require('../models/appModels/PaymentMode');
  const Taxes = require('../models/appModels/Taxes');
  const Client = require('../models/appModels/Client');
  const Task = require('../models/appModels/Task');
  const ProductCategory = require('../models/appModels/ProductCategory');
  const Product = require('../models/appModels/Product');
  const Supplier = require('../models/appModels/Supplier');
  const SupplierPurchase = require('../models/appModels/SupplierPurchase');
  const SupplierPayment = require('../models/appModels/SupplierPayment');
  const Quote = require('../models/appModels/Quote');
  const Invoice = require('../models/appModels/Invoice');
  const Payment = require('../models/appModels/Payment');

  await Promise.all([
    Admin.deleteMany(),
    AdminPassword.deleteMany(),
    Setting.deleteMany(),
    PaymentMode.deleteMany(),
    Taxes.deleteMany(),
    Client.deleteMany(),
    Task.deleteMany(),
    ProductCategory.deleteMany(),
    Product.deleteMany(),
    Supplier.deleteMany(),
    SupplierPurchase.deleteMany(),
    SupplierPayment.deleteMany(),
    Quote.deleteMany(),
    Invoice.deleteMany(),
    Payment.deleteMany(),
  ]);

  console.log('👍 AccessoHub CRM database reset complete. Run `npm run setup` to re-initialize.');
  process.exit();
}

deleteData();
