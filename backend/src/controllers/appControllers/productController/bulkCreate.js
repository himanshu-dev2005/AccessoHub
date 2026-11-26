const mongoose = require('../../../db');
const { loadSettings } = require('../../../middlewares/settings');

const Product = mongoose.model('Product');
const ProductCategory = mongoose.model('ProductCategory');

const escapeRegex = (val) => String(val).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const resolveCategoryId = async (rawCategory, adminId) => {
  if (!rawCategory) return null;
  if (mongoose.Types.ObjectId.isValid(rawCategory)) return rawCategory;

  const name = String(rawCategory).trim();
  if (!name) return null;

  let cat = await ProductCategory.findOne({
    name: new RegExp(`^${escapeRegex(name)}$`, 'i'),
    removed: false,
  }).exec();

  if (!cat) {
    cat = await new ProductCategory({
      name,
      description: `${name} category`,
      color: 'blue',
      enabled: true,
      createdBy: adminId,
    }).save();
  }
  return cat._id;
};

const bulkCreate = async (req, res) => {
  const rows = Array.isArray(req.body) ? req.body : req.body?.items;

  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'Please provide at least one product row.',
    });
  }

  const settings = await loadSettings();
  const defaultCurrency = settings['default_currency_code'] || 'INR';

  const results = [];
  const errors = [];

  for (let i = 0; i < rows.length; i++) {
    try {
      const row = rows[i];
      if (!row.name || !String(row.name).trim()) {
        throw new Error('Product name is required');
      }

      const categoryId = await resolveCategoryId(
        row.productCategory || row.category,
        req.admin?._id
      );

      const retailPrice = Number(row.retailPrice ?? row.price) || 0;
      const wholesalePrice = Number(row.wholesalePrice ?? retailPrice) || 0;
      const purchaseCost = Number(row.purchaseCost ?? row.costPrice) || 0;

      const doc = await new Product({
        name: String(row.name).trim(),
        ref: row.ref ? String(row.ref).trim() : '',
        productCategory: categoryId || undefined,
        retailPrice,
        wholesalePrice,
        purchaseCost,
        price: retailPrice,
        costPrice: purchaseCost,
        stock: Number(row.stock) || 0,
        currency: row.currency || defaultCurrency,
        description: row.description || '',
        enabled: row.enabled !== undefined ? Boolean(row.enabled) : true,
        removed: false,
        createdBy: req.admin?._id,
      }).save();

      results.push(doc);
    } catch (err) {
      errors.push({ row: i + 1, message: err.message || 'Failed to save product' });
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
        ? `Successfully imported ${results.length} products`
        : `Imported ${results.length} products, ${errors.length} failed`,
  });
};

module.exports = bulkCreate;
