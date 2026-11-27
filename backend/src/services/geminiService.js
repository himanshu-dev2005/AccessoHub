const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';

async function askGemini(prompt, systemPrompt = 'You are a helpful assistant.') {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    return '👋 AccessoHub AI is connected and ready! To enable live responses, please add your **GEMINI_API_KEY** in your `.env` file or in your **Vercel Project Settings > Environment Variables** (get a free key at [aistudio.google.com](https://aistudio.google.com/apikey)).';
  }

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    signal: AbortSignal.timeout(15000),
    body: JSON.stringify({
      model: 'gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'No response generated.';
}

async function askGeminiJSON(prompt, systemPrompt = 'You are a helpful assistant.') {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    // Return sample mock data so preview pages don't crash before key is set
    if (systemPrompt.includes('email writer')) {
      return {
        subject: 'Friendly Follow-up on Invoice',
        greeting: 'Dear Client,',
        body: 'Thank you for your business. Please add your GEMINI_API_KEY in Vercel / .env to generate dynamic customized emails.',
        closing: 'Best regards,\nAccessoHub Team',
      };
    }
    if (systemPrompt.includes('invoice data extractor')) {
      return {
        client: 'Sample Client',
        items: [{ name: 'Standard Service Item', description: 'Sample AI parsed item', quantity: 1, price: 1000 }],
        taxRate: 18,
        notes: 'Add your GEMINI_API_KEY in environment variables for live extraction.',
      };
    }
    if (systemPrompt.includes('financial analyst')) {
      return {
        summary: 'AccessoHub AI financial engine is ready. Connect your GEMINI_API_KEY to receive real-time automated revenue and procurement analytics.',
        insights: [
          { title: 'AI Engine Active', description: 'System is configured and waiting for Gemini API key.', type: 'info' },
          { title: 'Healthy Operations', description: 'Monitor pending tasks and invoices closely.', type: 'positive' }
        ],
        recommendations: [
          'Add your GEMINI_API_KEY in Vercel Project Settings > Environment Variables.',
          'Review overdue customer invoices regularly to maintain high cash flow.'
        ]
      };
    }
    if (systemPrompt.includes('payment prediction')) {
      return {
        predictions: [],
        overallRisk: 'Add GEMINI_API_KEY in Vercel to activate real-time predictive risk scoring.',
        actionItems: ['Configure GEMINI_API_KEY in Vercel environment variables to enable live risk prediction.']
      };
    }
  }

  const fullSystem =
    systemPrompt +
    '\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no code fences, no explanation.';
  const text = await askGemini(prompt, fullSystem);
  const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  return JSON.parse(cleaned);
}

module.exports = { askGemini, askGeminiJSON };
