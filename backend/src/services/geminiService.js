const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';

async function askGemini(prompt, systemPrompt = 'You are a helpful assistant.') {
  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GEMINI_API_KEY || ''}`,
    },
    body: JSON.stringify({
      model: 'gemini-2.0-flash',
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
  return data.choices[0].message.content;
}

async function askGeminiJSON(prompt, systemPrompt = 'You are a helpful assistant.') {
  const fullSystem =
    systemPrompt +
    '\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no code fences, no explanation.';
  const text = await askGemini(prompt, fullSystem);
  const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  return JSON.parse(cleaned);
}

module.exports = { askGemini, askGeminiJSON };
