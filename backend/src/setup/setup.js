require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });
const { globSync } = require('glob');
const fs = require('fs');
const { generate: uniqueId } = require('shortid');

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE);

async function setupApp() {
  try {
    const Admin = require('../models/coreModels/Admin');
    const AdminPassword = require('../models/coreModels/AdminPassword');
    const newAdminPassword = new AdminPassword();

    const salt = uniqueId();
    const passwordHash = newAdminPassword.generateHash(salt, 'admin123');

    const demoAdmin = {
      email: 'admin@accessohub.com',
      name: 'AccessoHub',
      surname: 'Admin',
      enabled: true,
      role: 'owner',
    };
    const adminResult = await new Admin(demoAdmin).save();

    const AdminPasswordData = {
      password: passwordHash,
      emailVerified: true,
      salt: salt,
      user: adminResult._id,
    };
    await new AdminPassword(AdminPasswordData).save();

    console.log('👍 Admin created (admin@accessohub.com / admin123)');

    const Setting = require('../models/coreModels/Setting');
    const settingFiles = [];
    const settingsFiles = globSync('./src/setup/defaultSettings/**/*.json');

    for (const filePath of settingsFiles) {
      const file = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      settingFiles.push(...file);
    }

    await Setting.insertMany(settingFiles);
    console.log('👍 Settings created');

    const PaymentMode = require('../models/appModels/PaymentMode');
    const Taxes = require('../models/appModels/Taxes');

    await Taxes.insertMany([
      { taxName: 'GST 0%', taxValue: 0, isDefault: true },
      { taxName: 'GST 18%', taxValue: 18, isDefault: false },
    ]);
    console.log('👍 Taxes created');

    const paymentModes = await PaymentMode.insertMany([
      {
        name: 'UPI / NEFT / RTGS',
        description: 'Direct Bank Transfer & UPI',
        isDefault: true,
      },
      {
        name: 'Corporate Card',
        description: 'Visa / Mastercard / RuPay',
        isDefault: false,
      },
    ]);
    console.log('👍 Payment Modes created');

    const Client = require('../models/appModels/Client');
    const Task = require('../models/appModels/Task');
    const ProductCategory = require('../models/appModels/ProductCategory');
    const Product = require('../models/appModels/Product');
    const Supplier = require('../models/appModels/Supplier');
    const SupplierPurchase = require('../models/appModels/SupplierPurchase');
    const SupplierPayment = require('../models/appModels/SupplierPayment');

    const clients = await Client.insertMany([
      {
        name: 'Northstar Logistics',
        company: 'Northstar Logistics Pvt Ltd',
        industry: 'Supply Chain',
        status: 'premium',
        category: 'wholesale',
        source: 'referral',
        email: 'procurement@northstarlogistics.example',
        phone: '+91 98201 55410',
        country: 'India',
        address: 'Bandra Kurla Complex, Mumbai',
        createdBy: adminResult._id,
      },
      {
        name: 'Aurelia FinTech',
        company: 'Aurelia Financial Technologies',
        industry: 'FinTech',
        status: 'active',
        category: 'retail',
        source: 'website',
        email: 'ops@aureliafintech.example',
        phone: '+91 80 4123 9001',
        country: 'India',
        address: 'Indiranagar, Bengaluru',
        createdBy: adminResult._id,
      },
    ]);

    const categories = await ProductCategory.insertMany([
      {
        name: 'Hardware & Devices',
        description: 'Enterprise networking and point-of-sale hardware',
        color: 'blue',
        enabled: true,
        createdBy: adminResult._id,
      },
      {
        name: 'Software Licenses',
        description: 'Annual SaaS and CRM seat subscriptions',
        color: 'purple',
        enabled: true,
        createdBy: adminResult._id,
      },
    ]);

    const products = await Product.insertMany([
      {
        name: 'AccessoHub Pro Gateway',
        ref: 'SKU-AH-101',
        productCategory: categories[0]._id,
        retailPrice: 18500,
        wholesalePrice: 15500,
        purchaseCost: 12000,
        price: 18500,
        costPrice: 12000,
        stock: 25,
        currency: 'INR',
        description: 'Smart enterprise access & telemetry hub',
        createdBy: adminResult._id,
      },
      {
        name: 'Annual CRM Seat License',
        ref: 'SKU-AH-201',
        productCategory: categories[1]._id,
        retailPrice: 6000,
        wholesalePrice: 4800,
        purchaseCost: 1500,
        price: 6000,
        costPrice: 1500,
        stock: 100,
        currency: 'INR',
        description: 'Per-user annual AccessoHub CRM subscription',
        createdBy: adminResult._id,
      },
    ]);

    const suppliers = await Supplier.insertMany([
      {
        name: 'Bharat ElectroTech Supply',
        company: 'Bharat ElectroTech Pvt Ltd',
        phone: '+91 98110 44210',
        email: 'sales@bharatelectrotech.example',
        gstNumber: '27AABCB1234D1Z5',
        country: 'India',
        address: 'MIDC Industrial Area, Pune',
        status: 'active',
        createdBy: adminResult._id,
      },
      {
        name: 'Deccan Cloud Distributors',
        company: 'Deccan Cloud Systems LLP',
        phone: '+91 40 2311 7788',
        email: 'billing@deccancloud.example',
        gstNumber: '36AACFD9981K1Z2',
        country: 'India',
        address: 'HITEC City, Hyderabad',
        status: 'active',
        createdBy: adminResult._id,
      },
    ]);

    const purchase = await new SupplierPurchase({
      number: 'PO-1001',
      supplier: suppliers[0]._id,
      product: products[0]._id,
      quantity: 10,
      unitPrice: 12000,
      taxRate: 18,
      subTotal: 120000,
      taxTotal: 21600,
      total: 141600,
      paidAmount: 75000,
      currency: 'INR',
      purchaseDate: new Date(),
      status: 'received',
      paymentStatus: 'partially',
      notes: 'Initial hardware batch received at Mumbai warehouse',
      createdBy: adminResult._id,
    }).save();

    await new SupplierPayment({
      number: 'SP-1001',
      supplier: suppliers[0]._id,
      supplierPurchase: purchase._id,
      paymentMode: paymentModes[0]._id,
      amount: 75000,
      currency: 'INR',
      date: new Date(),
      ref: 'UTR90812345',
      description: 'Advance NEFT settlement for PO-1001',
      createdBy: adminResult._id,
    }).save();

    await Task.insertMany([
      {
        title: 'Confirm balance payment for PO-1001 with Bharat ElectroTech',
        type: 'follow_up',
        priority: 'high',
        status: 'pending',
        dueDate: new Date(Date.now() + 2 * 86400000),
        description: 'Verify GST invoice and schedule remaining ₹66,600 transfer.',
        createdBy: adminResult._id,
      },
      {
        title: 'Prepare Q2 renewal proposal for Northstar Logistics',
        type: 'meeting',
        priority: 'urgent',
        status: 'in_progress',
        dueDate: new Date(Date.now() + 5 * 86400000),
        client: clients[0]._id,
        description: 'Include hardware bundles and multi-seat pricing in INR.',
        createdBy: adminResult._id,
      },
    ]);

    console.log('👍 Sample Inventory, Supplier & CRM data seeded');
    console.log('🥳 AccessoHub CRM Setup completed!');
    process.exit();
  } catch (e) {
    console.log('\n🚫 Error! The Error info is below');
    console.log(e);
    process.exit(1);
  }
}

setupApp();
