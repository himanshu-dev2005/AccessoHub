const { generate: uniqueId } = require('shortid');
const db = require('./index');

const appSettings = require('../setup/defaultSettings/appSettings.json');
const clientSettings = require('../setup/defaultSettings/clientSettings.json');
const companySettings = require('../setup/defaultSettings/companySettings.json');
const financeSettings = require('../setup/defaultSettings/financeSettings.json');
const invoiceSettings = require('../setup/defaultSettings/invoiceSettings.json');
const moneyFormatSettings = require('../setup/defaultSettings/moneyFormatSettings.json');
const quoteSettings = require('../setup/defaultSettings/quoteSettings.json');

let checkedOnce = false;

async function ensureInitialized() {
  if (checkedOnce) return;

  const Admin = db.model('Admin');
  const existingAdmins = await Admin.countDocuments({ removed: false });
  if (existingAdmins > 0) {
    checkedOnce = true;
    return;
  }

  const AdminPassword = db.model('AdminPassword');
  const Setting = db.model('Setting');
  const Taxes = db.model('Taxes');
  const PaymentMode = db.model('PaymentMode');

  const passwordHelper = new AdminPassword();
  const salt = uniqueId();
  const passwordHash = passwordHelper.generateHash(salt, 'admin123');

  const adminResult = await new Admin({
    email: 'admin@accessohub.com',
    name: 'AccessoHub',
    surname: 'Admin',
    enabled: true,
    role: 'owner',
  }).save();

  await new AdminPassword({
    password: passwordHash,
    emailVerified: true,
    salt,
    user: adminResult._id,
  }).save();

  const settingsCount = await Setting.countDocuments({});
  if (settingsCount === 0) {
    const settingData = [
      ...appSettings,
      ...clientSettings,
      ...companySettings,
      ...financeSettings,
      ...invoiceSettings,
      ...moneyFormatSettings,
      ...quoteSettings,
    ];
    if (settingData.length > 0) {
      await Setting.insertMany(settingData);
    }
  }

  const taxesCount = await Taxes.countDocuments({});
  if (taxesCount === 0) {
    await Taxes.insertMany([
      { taxName: 'GST 0%', taxValue: 0, isDefault: true },
      { taxName: 'GST 18%', taxValue: 18, isDefault: false },
    ]);
  }

  const paymentModesCount = await PaymentMode.countDocuments({});
  if (paymentModesCount === 0) {
    await PaymentMode.insertMany([
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
  }

  checkedOnce = true;
}

module.exports = ensureInitialized;
