// api/aiProxy.js -- placeholder to proxy to third-party AI if you want
// By default returns a canned response. Replace with real provider (OpenAI, etc.) and env vars.
export default async function handler(req,res){
  if (req.method !== 'POST') return res.status(405).json({ok:false});
  const {prompt} = req.body || {};
  // simple canned reply
  return res.status(200).json({ok:true, reply:`[AI placeholder] I heard: "${prompt?.slice(0,120)||''}" — integrate a real AI in api/aiProxy.js`});
}
