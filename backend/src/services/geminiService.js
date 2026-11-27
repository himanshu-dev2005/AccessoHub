const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';

async function askGemini(prompt, systemPrompt = 'You are a helpful assistant.') {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    return '👋 AccessoHub AI is connected and ready! To enable live Gemini responses, please add your **GEMINI_API_KEY** in your Vercel Project Settings > Environment Variables (get a free key at [aistudio.google.com](https://aistudio.google.com/apikey)).';
  }

  try {
    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify({
        model: 'gemini-3.8-flash',
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
      console.error('Gemini API error:', res.status, err);
      return `⚠️ Gemini API returned status ${res.status}. Please ensure your GEMINI_API_KEY in Vercel environment variables is valid.`;
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || 'No response generated.';
  } catch (err) {
    console.error('Gemini fetch error:', err.message);
    return `⚠️ AI connection note: ${err.message}. Please verify GEMINI_API_KEY in Vercel project settings.`;
  }
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
    if (systemPrompt.includes('meeting notes')) {
      return {
        summary: 'Sample summary: Discussed Q4 onboarding timeline and pricing tier options. Connect GEMINI_API_KEY in Vercel to analyze live transcripts.',
        sentiment: 'warm',
        keyDecisions: [
          'Proceed with standard onboarding package',
          'Schedule follow-up technical review next week'
        ],
        actionItems: [
          {
            title: 'Send updated proposal and pricing sheet',
            type: 'email',
            priority: 'high',
            description: 'Include annual discount options discussed on the call.'
          },
          {
            title: 'Follow-up check-in call with stakeholder',
            type: 'call',
            priority: 'medium',
            description: 'Confirm decision timeline and procurement steps.'
          }
        ]
      };
    }
    return {
      predictions: [],
      overallRisk: 'Add GEMINI_API_KEY in Vercel to activate real-time predictive risk scoring.',
      actionItems: ['Configure GEMINI_API_KEY in Vercel environment variables to enable live risk prediction.']
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

async function askGeminiVisionJSON(imageBase64, prompt, systemPrompt = 'You are an expert OCR and data extraction assistant.') {
  const getVisionFallback = (targetPrompt) => {
    if (targetPrompt.includes('product')) {
      return {
        name: 'Sample Extracted Product',
        ref: 'PRD-001',
        retailPrice: 1499,
        wholesalePrice: 1199,
        purchaseCost: 850,
        stock: 25,
        description: 'Demo data (add GEMINI_API_KEY in Vercel for live image OCR extraction).'
      };
    }
    if (targetPrompt.includes('invoice')) {
      return {
        client: 'Acme Enterprises',
        invoiceNumber: 'INV-2026-042',
        date: new Date().toISOString().split('T')[0],
        items: [
          { name: 'Consulting Services', description: 'Extracted line item', quantity: 2, price: 2500 }
        ],
        taxRate: 18,
        notes: 'Demo data (add GEMINI_API_KEY in Vercel for live receipt/invoice OCR).'
      };
    }
    return {
      name: 'Alex Morgan',
      company: 'Horizon Tech Pvt Ltd',
      email: 'alex.morgan@horizontech.io',
      phone: '+1 555-019-2834',
      industry: 'Technology',
      address: '420 Market Street, San Francisco, CA',
      country: 'United States',
      website: 'https://horizontech.io',
      notes: 'Demo data (add GEMINI_API_KEY in Vercel for live business card OCR).'
    };
  };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    return getVisionFallback(prompt);
  }

  try {
    const fullSystem =
      systemPrompt +
      '\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no code fences, no explanation.';
    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(15000),
      body: JSON.stringify({
        model: 'gemini-3.8-flash',
        messages: [
          { role: 'system', content: fullSystem },
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageBase64 } },
            ],
          },
        ],
        temperature: 0.2,
        max_tokens: 2048,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Gemini Vision API error:', res.status, errText);
      return getVisionFallback(prompt);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '';
    const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('askGeminiVisionJSON error, falling back:', err.message);
    return getVisionFallback(prompt);
  }
}

module.exports = { askGemini, askGeminiJSON, askGeminiVisionJSON };
