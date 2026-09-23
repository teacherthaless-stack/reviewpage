const allowedOrigin = process.env.APP_ORIGIN || 'https://teacherthaless-stack.github.io';

function allow(req, res) {
  const origin = req.headers.origin;
  if (origin === allowedOrigin) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return false;
  }
  return origin === allowedOrigin || !origin;
}

function textFromResponse(body) {
  if (typeof body.output_text === 'string' && body.output_text.trim()) return body.output_text.trim();
  return (body.output || []).flatMap(item => item.content || [])
    .filter(part => part.type === 'output_text' && typeof part.text === 'string')
    .map(part => part.text).join(' ').trim();
}

module.exports = { allow, textFromResponse };
