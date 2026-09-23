const { allow } = require('./_shared');

module.exports = async (req, res) => {
  if (!allow(req, res)) return res.status(403).json({ error: 'Origin not allowed' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: 'Teacher Emma voice is not configured yet.' });

  const text = typeof req.body?.text === 'string' ? req.body.text.trim().slice(0, 1800) : '';
  const basic = req.body?.level === 'Basic';
  if (!text) return res.status(400).json({ error: 'Text is required.' });

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini-tts',
      voice: process.env.OPENAI_TTS_VOICE || 'marin',
      input: text,
      instructions: basic
        ? 'Speak warmly, slowly, clearly, and encouragingly for a Brazilian beginner learning English. Sound calm and patient.'
        : 'Speak naturally, warmly, and expressively like an attentive English tutor. Use relaxed, human pacing.'
    })
  });

  if (!response.ok) return res.status(response.status).json({ error: 'Teacher Emma voice is unavailable.' });
  const audio = Buffer.from(await response.arrayBuffer());
  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).send(audio);
};
