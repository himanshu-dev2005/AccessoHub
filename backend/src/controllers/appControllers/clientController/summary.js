const mongoose = require('../../../db');
const moment = require('moment');

const InvoiceModel = mongoose.model('Invoice');

const summary = async (Model, req, res) => {
  let defaultType = 'month';
  const { type } = req.query;

  if (type && ['week', 'month', 'year'].includes(type)) {
    defaultType = type;
  } else if (type) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'Invalid type',
    });
  }

  const currentDate = moment();
  const startDate = currentDate.clone().startOf(defaultType).toDate();
  const endDate = currentDate.clone().endOf(defaultType).toDate();

  const [clients, invoices] = await Promise.all([
    Model.find({ removed: false }).skipPopulate().exec(),
    InvoiceModel.find({ removed: false }).skipPopulate().exec(),
  ]);

  const activeClientIds = new Set();
  for (const inv of invoices) {
    const clientId = inv.client && typeof inv.client === 'object' ? inv.client._id : inv.client;
    if (clientId) activeClientIds.add(String(clientId));
  }

  const enabledClients = clients.filter((c) => c.enabled !== false);
  const totalClients = enabledClients.length;
  const totalNewClients = enabledClients.filter((c) => {
    const created = c.created ? new Date(c.created) : null;
    return created && created >= startDate && created <= endDate;
  }).length;
  const activeClients = clients.filter((c) => activeClientIds.has(String(c._id))).length;

  const totalActiveClientsPercentage = totalClients > 0 ? (activeClients / totalClients) * 100 : 0;
  const totalNewClientsPercentage = totalClients > 0 ? (totalNewClients / totalClients) * 100 : 0;

  return res.status(200).json({
    success: true,
    result: {
      new: Math.round(totalNewClientsPercentage),
      active: Math.round(totalActiveClientsPercentage),
    },
    message: 'Successfully get summary of new clients',
  });
};

module.exports = summary;
