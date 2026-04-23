 const https = require('https');

module.exports = (req, res) => {
  if (req.method !== 'POST') { res.status(405).end(); return; }

  const { type, platform, style, topic } = req.body;

  const bodyData = JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: '你是短影音操盤手，用台灣口語寫腳本，格式：【開場】【中段】【反轉】【結尾】，只輸出台詞。' },
      { role: 'user', content: `帳號：${type}，平台：${platform}，風格：${style}，主題：${topic}` }
    ],
    max_tokens: 1000
  });

  const options = {
    hostname: 'api.openai.com',
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY,
      'Content-Length': Buffer.byteLength(bodyData)
    }
  };

  const apiReq = https.request(options, (apiRes) => {
    let data = '';
    apiRes.on('data', chunk => { data += chunk; });
    apiRes.on('end', () => {
      try {
        const json = JSON.parse(data);
        const text = json.choices[0].message.content;
        res.status(200).json({ result: text });
      } catch(e) {
        res.status(500).json({ error: data });
      }
    });
  });

  apiReq.on('error', (e) => { res.status(500).json({ error: e.message }); });
  apiReq.write(bodyData);
  apiReq.end();
};
