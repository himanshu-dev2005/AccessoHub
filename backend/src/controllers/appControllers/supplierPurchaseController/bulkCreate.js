const mongoose = require('../../../db');
const { calculate } = require('../../../helpers');
const { loadSettings } = require('../../../middlewares/settings');

const SupplierPurchase = mongoose.model('SupplierPurchase');
const Supplier = mongoose.model('Supplier');
const Product = mongoose.model('Product');

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

const resolveProductId = async (rawProduct) => {
  if (!rawProduct) return null;
  if (mongoose.Types.ObjectId.isValid(rawProduct)) return rawProduct;

  const text = String(rawProduct).trim();
  if (!text) return null;

  const rx = new RegExp(`^${escapeRegex(text)}$`, 'i');
  const prod = await Product.findOne({
    $or: [{ name: rx }, { ref: rx }],
    removed: false,
  }).exec();

  return prod ? prod._id : null;
};

const bulkCreate = async (req, res) => {
  const rows = Array.isArray(req.body) ? req.body : req.body?.items;

  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'Please provide at least one purchase row.',
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
        throw new Error('PO Number is required');
      }

      const supplierId = await resolveSupplierId(row.supplier, req.admin?._id);
      if (!supplierId) {
        throw new Error('Supplier is required');
      }

      const productId = await resolveProductId(row.product);
      const quantity = Math.max(1, Number(row.quantity) || 1);
      const unitPrice = Math.max(0, Number(row.unitPrice) || 0);
      const taxRate = Math.max(0, Number(row.taxRate) || 0);

      const subTotal = calculate.multiply(quantity, unitPrice);
      const taxTotal = calculate.multiply(subTotal, taxRate / 100);
      const total = calculate.add(subTotal, taxTotal);

      const status = ['draft', 'ordered', 'received', 'cancelled'].includes(
        String(row.status || '').toLowerCase()
      )
        ? String(row.status).toLowerCase()
        : 'ordered';

      const paidAmount = Math.max(0, Number(row.paidAmount) || 0);
      const paymentStatus =
        paidAmount >= total && total > 0 ? 'paid' : paidAmount > 0 ? 'partially' : 'unpaid';

      const doc = await new SupplierPurchase({
        number: String(row.number).trim(),
        supplier: supplierId,
        product: productId || undefined,
        quantity,
        unitPrice,
        taxRate,
        subTotal,
        taxTotal,
        total,
        paidAmount,
        paymentStatus,
        status,
        purchaseDate: row.purchaseDate ? new Date(row.purchaseDate) : new Date(),
        expectedDate: row.expectedDate ? new Date(row.expectedDate) : undefined,
        currency: row.currency || defaultCurrency,
        notes: row.notes || '',
        removed: false,
        createdBy: req.admin?._id,
      }).save();

      if (status === 'received' && productId) {
        await Product.findByIdAndUpdate(productId, {
          $inc: { stock: quantity },
          $set: { updated: new Date() },
        }).exec();
      }

      results.push(doc);
    } catch (err) {
      errors.push({ row: i + 1, message: err.message || 'Failed to save supplier purchase' });
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
        ? `Successfully imported ${results.length} supplier purchases`
        : `Imported ${results.length} purchases, ${errors.length} failed`,
  });
};

module.exports = bulkCreate;
