const OpenAI = require('openai');

const client = new OpenAI({
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
  apiKey: process.env.GEMINI_API_KEY || '',
});

async function askGemini(prompt, systemPrompt = 'You are a helpful assistant.') {
  const response = await client.chat.completions.create({
    model: 'gemini-2.0-flash',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 2048,
  });
  return response.choices[0].message.content;
}

async function askGeminiJSON(prompt, systemPrompt = 'You are a helpful assistant.') {
  const fullSystem = systemPrompt + '\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no code fences, no explanation.';
  const text = await askGemini(prompt, fullSystem);
  // Strip any accidental code fences
  const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  return JSON.parse(cleaned);
}

module.exports = { askGemini, askGeminiJSON };
