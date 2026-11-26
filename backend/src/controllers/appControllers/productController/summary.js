const mongoose = require('@/db');

const Model = mongoose.model('Product');

const summary = async (req, res) => {
  const products = await Model.find({ removed: false }).skipPopulate().exec();

  let count = 0;
  let totalStock = 0;
  let inventoryValue = 0;
  let lowStockCount = 0;

  for (const p of products) {
    count += 1;
    const stock = Number(p.stock || 0);
    const unitPrice = Number(p.retailPrice ?? p.price ?? 0);
    totalStock += stock;
    inventoryValue += unitPrice * stock;
    if (stock <= 5) lowStockCount += 1;
  }

  return res.status(200).json({
    success: true,
    result: {
      count,
      totalStock,
      total: inventoryValue,
      lowStock: lowStockCount,
    },
    message: 'Successfully fetched product summary',
  });
};

module.exports = summary;
