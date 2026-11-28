const { askGemini, askGeminiJSON } = require('../services/geminiService');

const aiController = {
  // 1. AI Business Chatbot
  async chatbot(req, res) {
    try {
      const { message, context } = req.body;
      if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

      const systemPrompt = `You are AccessoHub AI Assistant, a helpful business intelligence chatbot for an ERP/CRM system.
You help users understand their business data, answer questions about invoices, payments, customers, products, and suppliers.
Be concise, professional, and data-driven. If context data is provided, use it to give specific answers.
Format numbers with appropriate currency symbols. Use bullet points for lists. Keep responses under 200 words.`;

      const userPrompt = context
        ? `Business Context:\n${JSON.stringify(context, null, 2)}\n\nUser Question: ${message}`
        : message;

      const reply = await askGemini(userPrompt, systemPrompt);
      return res.json({ success: true, result: { reply } });
    } catch (error) {
      console.error('Chatbot error:', error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // 2. AI Email Drafter
  async draftEmail(req, res) {
    try {
      const { customerName, customerEmail, context, tone = 'professional' } = req.body;
      if (!customerName || !context)
        return res.status(400).json({ success: false, message: 'customerName and context are required' });

      const systemPrompt = `You are a professional business email writer for AccessoHub CRM.
Write a complete email. The tone should be ${tone}.
Return JSON with these exact fields: { "subject": "...", "greeting": "...", "body": "...", "closing": "..." }
Do not include email addresses in the body. Make it natural and human.`;

      const userPrompt = `Write an email to ${customerName} (${customerEmail || 'no email provided'}).
Purpose: ${context}`;

      const result = await askGeminiJSON(userPrompt, systemPrompt);
      return res.json({ success: true, result });
    } catch (error) {
      console.error('Email draft error:', error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // 3. Financial Insights
  async financialInsights(req, res) {
    try {
      const { data } = req.body;
      if (!data)
        return res.status(400).json({ success: false, message: 'Data is required' });

      const systemPrompt = `You are a financial analyst AI for AccessoHub CRM.
Analyze the provided business data and generate actionable insights.
Return JSON with:
{
  "summary": "2-3 sentence overview",
  "insights": [{"title": "string", "description": "string", "type": "positive|warning|info"}],
  "recommendations": ["actionable suggestion 1", "actionable suggestion 2", ...]
}
Be specific with numbers and percentages. Generate 3-5 insights and 3-5 recommendations.`;

      const userPrompt = `Analyze this business data:\n${JSON.stringify(data, null, 2)}`;
      const result = await askGeminiJSON(userPrompt, systemPrompt);
      return res.json({ success: true, result });
    } catch (error) {
      console.error('Insights error:', error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // 5. Silent Customer & Churn Radar
  async churnRadar(req, res) {
    try {
      const { customers = [] } = req.body;
      const systemPrompt = `You are a customer retention & churn radar AI for AccessoHub CRM.
Analyze the provided customers and their activity/invoice metrics to identify silent or at-risk accounts.
Return JSON with:
{
  "summary": "2-3 sentence overview of customer retention health",
  "atRiskCustomers": [
    {
      "name": "customer name",
      "email": "customer email if provided",
      "daysSilent": number,
      "riskLevel": "high|medium|low",
      "reason": "why they are flagged",
      "winBackOffer": "specific personalized win-back suggestion",
      "suggestedEmailSubject": "compelling subject line"
    }
  ]
}`;

      const userPrompt = `Analyze these customers for churn/inactivity risk:\n${JSON.stringify(customers.slice(0, 30), null, 2)}`;
      const result = await askGeminiJSON(userPrompt, systemPrompt);
      return res.json({ success: true, result });
    } catch (error) {
      console.error('Churn radar error:', error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // 9. Smart Margin & Supplier Profit Optimizer
  async marginOptimizer(req, res) {
    try {
      const { products = [] } = req.body;
      const systemPrompt = `You are a pricing & margin optimizer AI for AccessoHub ERP/CRM.
Analyze the product catalog (retailPrice, wholesalePrice, purchaseCost, stock) and identify profit leaks, low-margin items, and restock opportunities.
Return JSON with:
{
  "summary": "2-3 sentence overview of catalog profitability",
  "recommendations": [
    {
      "productName": "product name",
      "issue": "short description of margin/stock issue",
      "action": "specific pricing or supplier negotiation action",
      "priority": "high|medium|low"
    }
  ]
}`;

      const userPrompt = `Analyze these products for margin & stock optimization:\n${JSON.stringify(products.slice(0, 40), null, 2)}`;
      const result = await askGeminiJSON(userPrompt, systemPrompt);
      return res.json({ success: true, result });
    } catch (error) {
      console.error('Margin optimizer error:', error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // 10. Command-Bar AI Copilot (Ctrl+K)
  async commandCopilot(req, res) {
    try {
      const { command } = req.body;
      if (!command || !command.trim()) {
        return res.status(400).json({ success: false, message: 'Command is required' });
      }

      const systemPrompt = `You are the Command Copilot for AccessoHub CRM.
Map the user's natural language command to ONE of these JSON actions:
1. Navigate to a page:
   { "action": "navigate", "path": "/| /customer | /task | /product | /productcategory | /supplier | /supplierpurchase | /supplierpayment | /quote | /invoice | /payment | /settings | /ai/email | /ai/insights | /ai/churn-radar | /ai/margin-optimizer | /ai/cashflow-bridge", "label": "friendly page name" }
2. Create a CRM task:
   { "action": "create_task", "task": { "title": "string", "type": "call|email|meeting|follow_up|demo|other", "priority": "low|medium|high|urgent", "description": "string" } }
3. Create a customer:
   { "action": "create_client", "client": { "name": "string", "company": "string", "email": "string", "phone": "string" } }
4. Answer a general CRM question:
   { "action": "answer", "reply": "concise helpful answer" }

Choose the best matching action.`;

      const result = await askGeminiJSON(command, systemPrompt);
      return res.json({ success: true, result });
    } catch (error) {
      console.error('Command copilot error:', error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // 11. Cash-Flow & Working Capital Bridge
  async cashflowBridge(req, res) {
    try {
      const { totalReceivable = 0, totalPayable = 0, netGap = 0, unpaidInvoices = [], unpaidPurchases = [] } = req.body;
      const systemPrompt = `You are a cashflow bridge & working capital CFO AI for AccessoHub ERP/CRM.
Compare customer receivables (money coming in) against supplier payables (money going out) and build a prioritized collection & payout plan.
Return JSON with:
{
  "summary": "2-3 sentence assessment of working capital position",
  "urgencyLevel": "low|medium|high",
  "collectionPriority": [
    {
      "invoiceNumber": "string",
      "client": "string",
      "amountDue": number,
      "reason": "why to collect this first"
    }
  ],
  "paymentStrategy": ["actionable strategy 1", "actionable strategy 2"]
}`;

      const userPrompt = `Working Capital Snapshot:
Total Receivable: ${totalReceivable}
Total Payable: ${totalPayable}
Net Bridge (Receivable - Payable): ${netGap}

Top Unpaid Customer Invoices:
${JSON.stringify(unpaidInvoices.slice(0, 15), null, 2)}

Top Unpaid Supplier Purchases:
${JSON.stringify(unpaidPurchases.slice(0, 15), null, 2)}`;

      const result = await askGeminiJSON(userPrompt, systemPrompt);
      return res.json({ success: true, result });
    } catch (error) {
      console.error('Cashflow bridge error:', error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = aiController;
