const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

async function callNativeGemini(apiKey, model, prompt, systemPrompt) {
  const modelName = model.startsWith('models/') ? model : `models/${model}`;
  const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`;
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(4500),
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    }),
  });
}

async function discoverAvailableModel(apiKey) {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`,
      { signal: AbortSignal.timeout(3000) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const candidates = (data.models || []).filter((m) =>
      Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent')
    );
    const flash = candidates.find((m) => m.name.includes('flash'));
    return (flash || candidates[0])?.name || null;
  } catch {
    return null;
  }
}

async function askGemini(prompt, systemPrompt = 'You are a helpful assistant.') {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    return '👋 AccessoHub AI is connected and ready! To enable live Gemini responses, please add your **GEMINI_API_KEY** in your Vercel Project Settings > Environment Variables (get a free key at [aistudio.google.com](https://aistudio.google.com/apikey)).';
  }

  let lastError = '';
  let saw404 = false;
  for (const model of GEMINI_MODELS) {
    try {
      const res = await callNativeGemini(apiKey, model, prompt, systemPrompt);
      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
        if (text) return text;
      } else {
        const errBody = await res.text();
        let apiMsg = `Status ${res.status}`;
        try {
          const parsed = JSON.parse(errBody);
          if (parsed?.error?.message) apiMsg = `${res.status}: ${parsed.error.message}`;
        } catch {}
        lastError = apiMsg;
        console.error(`Gemini (${model}) error:`, res.status, errBody.slice(0, 300));
        if (res.status === 404) saw404 = true;
        if (res.status === 400 || res.status === 403) {
          return `⚠️ Invalid or unauthorized GEMINI_API_KEY (${apiMsg}). Please update GEMINI_API_KEY in Vercel Environment Variables (get a free key at https://aistudio.google.com/apikey).`;
        }
      }
    } catch (err) {
      lastError = err.message;
      console.error(`Gemini (${model}) fetch error:`, err.message);
    }
  }

  if (saw404) {
    const discovered = await discoverAvailableModel(apiKey);
    if (discovered) {
      try {
        const res = await callNativeGemini(apiKey, discovered, prompt, systemPrompt);
        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
          if (text) return text;
        }
      } catch (err) {
        lastError = err.message;
      }
    }
  }

  return `⚠️ AI could not reach Gemini (${lastError || 'timeout'}). Please verify your GEMINI_API_KEY in Vercel project settings.`;
}

async function askGeminiJSON(prompt, systemPrompt = 'You are a helpful assistant.') {
  const getFallback = () => {
    if (systemPrompt.includes('email writer')) {
      return {
        subject: 'Friendly Follow-up on Invoice',
        greeting: 'Dear Client,',
        body: 'Thank you for your business. Please configure your GEMINI_API_KEY in Vercel to generate custom emails.',
        closing: 'Best regards,\nAccessoHub Team',
      };
    }
    if (systemPrompt.includes('invoice data extractor')) {
      return {
        client: 'Sample Client Corp',
        items: [{ name: 'Services Rendered', description: 'Extracted invoice line item', quantity: 1, price: 5000 }],
        taxRate: 18,
        notes: 'Connect GEMINI_API_KEY in Vercel for live natural language invoice extraction.',
      };
    }
    if (systemPrompt.includes('financial analyst')) {
      return {
        summary: 'AccessoHub AI financial engine is active. Add your GEMINI_API_KEY to unlock automated live financial analytics.',
        insights: [
          { title: 'AI Engine Ready', description: 'System is online and waiting for GEMINI_API_KEY.', type: 'info' },
          { title: 'Steady Operations', description: 'Monitor invoices and payments periodically.', type: 'positive' }
        ],
        recommendations: [
          'Add GEMINI_API_KEY in Vercel Project Settings > Environment Variables.',
          'Review overdue customer invoices regularly to maintain cash flow.'
        ]
      };
    }
    if (systemPrompt.includes('cashflow bridge')) {
      return {
        summary: 'Sample Cash-Flow Bridge: Prioritize collecting your largest overdue customer invoices first to cover upcoming supplier payables without dipping into reserves.',
        urgencyLevel: 'medium',
        collectionPriority: [
          {
            invoiceNumber: 'INV-Sample',
            client: 'Sample Client',
            amountDue: 15000,
            reason: 'Collecting this covers immediate supplier obligations.'
          }
        ],
        paymentStrategy: [
          'Follow up on invoices past their expiry date before scheduling non-urgent supplier payouts.',
          'Add GEMINI_API_KEY in Vercel for live AI working-capital prioritization.'
        ]
      };
    }
    if (systemPrompt.includes('churn radar')) {
      return {
        summary: 'Sample Churn Radar: Detected accounts with extended inactivity. Add GEMINI_API_KEY in Vercel for live AI churn scoring.',
        atRiskCustomers: [
          {
            name: 'Sample Dormant Account',
            daysSilent: 45,
            riskLevel: 'high',
            reason: 'No recent invoices or follow-up activity in the last 45 days.',
            winBackOffer: 'Offer a 10% loyalty renewal discount or complimentary Q4 check-in.',
            suggestedEmailSubject: 'Checking in + special loyalty offer for your team'
          }
        ]
      };
    }
    if (systemPrompt.includes('margin optimizer')) {
      return {
        summary: 'Sample Margin Analysis: Review low-margin SKUs and reorder levels. Add GEMINI_API_KEY in Vercel for live SKU profitability insights.',
        recommendations: [
          {
            productName: 'Sample SKU',
            issue: 'Thin retail margin relative to purchase cost',
            action: 'Consider a 5-8% retail price adjustment or negotiate bulk supplier pricing.',
            priority: 'high'
          }
        ]
      };
    }
    if (systemPrompt.includes('command copilot')) {
      return {
        action: 'answer',
        reply: 'Command Copilot is ready! Try navigation commands like "go to invoices", "open document scanner", or configure GEMINI_API_KEY in Vercel for full natural-language CRM actions.'
      };
    }
    return {
      summary: 'AI response fallback active. Add GEMINI_API_KEY in Vercel environment variables for live results.',
    };
  };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    return getFallback();
  }

  try {
    const fullSystem =
      systemPrompt +
      '\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no code fences, no explanation.';
    const text = await askGemini(prompt, fullSystem);
    const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('askGeminiJSON parse error, falling back:', err.message);
    return getFallback();
  }
}

module.exports = { askGemini, askGeminiJSON };
