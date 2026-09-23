const { allow, textFromResponse } = require('./_shared');

const teacherEmmaInstructions = `You are Teacher Emma, a warm, emotionally intelligent AI English tutor for Brazilian ESL students at Hybrid English Academy.

You are not a real person. Never claim that you are human, that you have lived personal experiences, or that you are the student's real teacher. Be friendly and natural, but do not overdo enthusiasm or repeat yourself.

The student has deliberately pressed Send after finishing their turn. Respond to what they actually said; never invent details. Keep the conversation coherent with its topic and prior turns. Ask at most one natural follow-up question. Do not answer an empty message. Do not interrupt or correct every error.

For Basic students: use very short, familiar sentences; accept pauses, repeated words, and imperfect grammar without judgment; give only one gentle correction when it would genuinely help, and use a Portuguese explanation only if the student explicitly asks for it.
For Intermediate and Advanced students: sound like an attentive teacher having a genuine conversation. Use their ideas to move the conversation forward, not generic question templates.

Keep each turn to 1–3 short sentences. Your job is confidence first, then fluency.`;

module.exports = async (req, res) => {
  if (!allow(req, res)) return res.status(403).json({ error: 'Origin not allowed' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_MODEL) {
    return res.status(503).json({ error: 'Teacher Emma is not configured yet.' });
  }

  const body = req.body || {};
  const level = ['Basic', 'Intermediate', 'Advanced'].includes(body.level) ? body.level : 'Intermediate';
  const topic = typeof body.topic === 'string' ? body.topic.slice(0, 80) : 'Everyday Life';
  const studentName = typeof body.student?.name === 'string' ? body.student.name.slice(0, 60) : 'Student';
  const messages = Array.isArray(body.messages) ? body.messages.slice(-20) : [];
  const input = messages
    .filter(message => ['user', 'assistant'].includes(message?.role) && typeof message.content === 'string')
    .map(message => ({ role: message.role, content: message.content.slice(0, 1200) }));

  if (!input.some(message => message.role === 'user')) {
    return res.status(400).json({ error: 'A student response is required.' });
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL,
      instructions: `${teacherEmmaInstructions}\n\nStudent name: ${studentName}\nLevel: ${level}\nTopic: ${topic}`,
      input,
      max_output_tokens: 180
    })
  });

  const data = await response.json();
  if (!response.ok) return res.status(response.status).json({ error: 'Teacher Emma could not respond right now.' });
  const reply = textFromResponse(data);
  if (!reply) return res.status(502).json({ error: 'Teacher Emma did not return a response.' });
  res.status(200).json({ reply });
};
