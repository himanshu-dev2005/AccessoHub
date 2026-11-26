const mongoose = require('../../../db');
const { calculate } = require('../../../helpers');
const { loadSettings } = require('../../../middlewares/settings');

const SupplierPayment = mongoose.model('SupplierPayment');
const Supplier = mongoose.model('Supplier');
const SupplierPurchase = mongoose.model('SupplierPurchase');
const PaymentMode = mongoose.model('PaymentMode');

const escapeRegex = (val) => String(val).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const resolveSupplierId = async (rawSupplier, adminId) => {
  if (!rawSupplier) return null;
  if (mongoose.Types.ObjectId.isValid(rawSupplier)) return rawSupplier;

  const text = String(rawSupplier).trim();
  if (!text) return null;

  const rx = new RegExp(`^${escapeRegex(text)}$`, 'i');
  let sup = await Supplier.findOne({
    $or: [{ name: rx }, { company: rx }],
    removed: false,
  }).exec();

  if (!sup) {
    sup = await new Supplier({
      name: text,
      company: text,
      status: 'active',
      createdBy: adminId,
    }).save();
  }
  return sup._id;
};

const resolvePurchase = async (rawPurchase) => {
  if (!rawPurchase) return null;
  if (mongoose.Types.ObjectId.isValid(rawPurchase)) {
    return SupplierPurchase.findOne({ _id: rawPurchase, removed: false }).exec();
  }

  const text = String(rawPurchase).trim();
  if (!text) return null;

  return SupplierPurchase.findOne({
    number: new RegExp(`^${escapeRegex(text)}$`, 'i'),
    removed: false,
  }).exec();
};

const resolvePaymentModeId = async (rawMode) => {
  if (!rawMode) return null;
  if (mongoose.Types.ObjectId.isValid(rawMode)) return rawMode;

  const text = String(rawMode).trim();
  if (!text) return null;

  const mode = await PaymentMode.findOne({
    name: new RegExp(`^${escapeRegex(text)}$`, 'i'),
    removed: false,
  }).exec();

  return mode ? mode._id : null;
};

const bulkCreate = async (req, res) => {
  const rows = Array.isArray(req.body) ? req.body : req.body?.items;

  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'Please provide at least one supplier payment row.',
    });
  }

  const settings = await loadSettings();
  const defaultCurrency = settings['default_currency_code'] || 'INR';

  const results = [];
  const errors = [];

  for (let i = 0; i < rows.length; i++) {
    try {
      const row = rows[i];
      if (!row.number || !String(row.number).trim()) {
        throw new Error('Payment # is required');
      }

      const amount = Number(row.amount) || 0;
      if (amount <= 0) {
        throw new Error('Payment amount must be greater than 0');
      }

      const purchase = await resolvePurchase(row.supplierPurchase);
      let supplierId = await resolveSupplierId(row.supplier, req.admin?._id);

      if (purchase) {
        const maxPayable = calculate.sub(purchase.total || 0, purchase.paidAmount || 0);
        if (amount > maxPayable && maxPayable > 0) {
          throw new Error(
            `Amount ${amount} exceeds remaining balance (${maxPayable}) for ${purchase.number}`
          );
        }
        if (!supplierId) {
          supplierId = purchase.supplier?._id || purchase.supplier;
        }
        const newPaid = calculate.add(purchase.paidAmount || 0, amount);
        const paymentStatus =
          newPaid >= (purchase.total || 0) ? 'paid' : newPaid > 0 ? 'partially' : 'unpaid';

        await SupplierPurchase.findByIdAndUpdate(purchase._id, {
          $set: { paidAmount: newPaid, paymentStatus, updated: new Date() },
        }).exec();
      }

      if (!supplierId) {
        throw new Error('Supplier is required');
      }

      const paymentModeId = await resolvePaymentModeId(row.paymentMode);

      const doc = await new SupplierPayment({
        number: String(row.number).trim(),
        supplier: supplierId,
        supplierPurchase: purchase ? purchase._id : undefined,
        paymentMode: paymentModeId || undefined,
        amount,
        currency: row.currency || defaultCurrency,
        date: row.date ? new Date(row.date) : new Date(),
        ref: row.ref || '',
        description: row.description || '',
        removed: false,
        createdBy: req.admin?._id,
      }).save();

      results.push(doc);
    } catch (err) {
      errors.push({ row: i + 1, message: err.message || 'Failed to save supplier payment' });
    }
  }

  return res.status(results.length > 0 ? 200 : 400).json({
    success: results.length > 0,
    result: {
      createdCount: results.length,
      failedCount: errors.length,
      results,
      errors,
    },
    message:
      errors.length === 0
        ? `Successfully imported ${results.length} supplier payments`
        : `Imported ${results.length} payments, ${errors.length} failed`,
  });
};

module.exports = bulkCreate;
