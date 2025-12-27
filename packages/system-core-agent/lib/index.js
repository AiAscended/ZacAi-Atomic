import fs from 'fs';
import path from 'path';

// Resolve to workspace-relative model data so agent reliably finds local seed weights
const weightsPath = path.resolve(process.cwd(), 'packages/system-core-model/data/seed_weights.json');

async function callOpenAI(prompt) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY not set');
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], max_tokens: 300 })
  });
  const j = await res.json();
  return j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content || JSON.stringify(j);
}

export async function recommendAction(prompt) {
  // Prefer local knowledge
  try {
    if (fs.existsSync(weightsPath)) {
      const data = JSON.parse(fs.readFileSync(weightsPath, 'utf8'));
      // Very simple deterministic reply using seeds
      const match = data.prompts.find(p => prompt.toLowerCase().includes(p.split(' ')[0].toLowerCase()));
      const reply = match ? `LOCAL_MODEL: ${match} — recommended with weights v=${data.version}` : `LOCAL_MODEL: No exact seed match; suggest running diagnostics.`;
      return reply;
    }
  } catch (e) {
    // continue to fallback
  }

  // Fallback to OpenAI if available
  try {
    const aiReply = await callOpenAI(prompt);
    return `OPENAI: ${aiReply}`;
  } catch (e) {
    return `ERROR: no local model and OpenAI unavailable (${e.message})`;
  }
}
