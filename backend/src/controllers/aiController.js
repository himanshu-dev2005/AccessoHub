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

  // 3. Smart Invoice Generator
  async smartInvoice(req, res) {
    try {
      const { description } = req.body;
      if (!description)
        return res.status(400).json({ success: false, message: 'Description is required' });

      const systemPrompt = `You are an invoice data extractor for AccessoHub CRM.
Parse the natural language description into structured invoice data.
Return JSON with: { "client": "string", "items": [{"name": "string", "description": "string", "quantity": number, "price": number}], "taxRate": number, "notes": "string" }
taxRate should be a percentage number (e.g., 18 for 18%). Infer reasonable defaults for missing fields.
price should be per-unit price as a number.`;

      const result = await askGeminiJSON(description, systemPrompt);
      return res.json({ success: true, result });
    } catch (error) {
      console.error('Smart invoice error:', error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // 4. Financial Insights
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

  // 5. Payment Prediction
  async paymentPrediction(req, res) {
    try {
      const { invoices } = req.body;
      if (!invoices || !Array.isArray(invoices))
        return res.status(400).json({ success: false, message: 'Invoices array is required' });

      const systemPrompt = `You are a payment prediction AI for AccessoHub CRM.
Analyze the invoice data and predict payment likelihood.
Return JSON with:
{
  "predictions": [{"invoiceId": "string", "client": "string", "amount": number, "riskLevel": "low|medium|high", "predictedPayDate": "YYYY-MM-DD", "reason": "string"}],
  "overallRisk": "string summary of overall risk",
  "actionItems": ["specific follow-up action 1", "specific follow-up action 2", ...]
}
Consider factors: days overdue, amount size, client history, status. Generate realistic predictions.`;

      const userPrompt = `Analyze these invoices for payment risk:\n${JSON.stringify(invoices, null, 2)}`;
      const result = await askGeminiJSON(userPrompt, systemPrompt);
      return res.json({ success: true, result });
    } catch (error) {
      console.error('Prediction error:', error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = aiController;
