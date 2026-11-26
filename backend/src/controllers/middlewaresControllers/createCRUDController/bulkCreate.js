const bulkCreate = async (Model, req, res) => {
  const rows = Array.isArray(req.body) ? req.body : req.body?.items;

  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'Please provide at least one row to import.',
    });
  }

  const results = [];
  const errors = [];

  for (let i = 0; i < rows.length; i++) {
    try {
      const payload = {
        ...rows[i],
        removed: false,
        createdBy: req.admin?._id,
      };
      const doc = await new Model(payload).save();
      results.push(doc);
    } catch (err) {
      errors.push({
        row: i + 1,
        message: err.message || 'Validation failed',
      });
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
        ? `Successfully created ${results.length} records`
        : `Created ${results.length} records, ${errors.length} failed`,
  });
};

module.exports = bulkCreate;
