const summary = async (Model, req, res) => {
  const countPromise = Model.countDocuments({
    removed: false,
  });

  let filterPromise = countPromise;
  if (req.query.filter && req.query.equal !== undefined) {
    filterPromise = Model.countDocuments({
      removed: false,
      [req.query.filter]: req.query.equal,
    }).exec();
  }

  const [countFilter, countAllDocs] = await Promise.all([filterPromise, countPromise]);

  if (countAllDocs > 0) {
    return res.status(200).json({
      success: true,
      result: { countFilter, countAllDocs },
      message: 'Successfully counted all documents',
    });
  } else {
    return res.status(200).json({
      success: true,
      result: { countFilter: 0, countAllDocs: 0 },
      message: 'Collection is Empty',
    });
  }
};

module.exports = summary;
