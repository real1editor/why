// api/sendMessage.js
import fetch from 'node-fetch';

const BOT = process.env.TG_BOT_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN';
const CHAT = process.env.TG_CHAT_ID || 'YOUR_TELEGRAM_CHAT_ID';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ok:false, error:'only POST'});
  const body = req.body || {};
  const name = body.name || body.fb_name || 'Anonymous';
  const email = body.email || body.fb_email || '';
  const message = body.message || body.project || body.fb_message || '[no message]';
  const text = `📩 *WebApp Contact*\n*Name:* ${escape(name)}\n*Email:* ${escape(email)}\n*Message:*\n${escape(message)}`;
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT}/sendMessage`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ chat_id: CHAT, text, parse_mode:'Markdown' })
    });
    const json = await response.json();
    if (!json.ok) return res.status(500).json({ok:false, detail:json});
    return res.status(200).json({ok:true, result:json.result});
  } catch(err) {
    return res.status(500).json({ok:false, error:err.message});
  }
}
function escape(s=''){ return String(s).replace(/([_*[\]()~`>#+-=|{}.!\\])/g,'\\$1'); }
