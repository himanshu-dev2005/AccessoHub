const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.post('/ai/chat', asyncHandler(aiController.chatbot));
router.post('/ai/email', asyncHandler(aiController.draftEmail));
router.post('/ai/invoice', asyncHandler(aiController.smartInvoice));
router.post('/ai/insights', asyncHandler(aiController.financialInsights));
router.post('/ai/predictions', asyncHandler(aiController.paymentPrediction));
router.post('/ai/scan', asyncHandler(aiController.scanDocument));
router.post('/ai/meeting-notes', asyncHandler(aiController.summarizeMeeting));
router.post('/ai/churn-radar', asyncHandler(aiController.churnRadar));
router.post('/ai/margin-optimizer', asyncHandler(aiController.marginOptimizer));
router.post('/ai/command', asyncHandler(aiController.commandCopilot));
router.post('/ai/cashflow-bridge', asyncHandler(aiController.cashflowBridge));

module.exports = router;
