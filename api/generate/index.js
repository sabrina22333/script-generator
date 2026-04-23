 export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { type, platform, style, topic } = req.body;

  const systemPrompt = `你是一位有七年經驗、操作過百萬流量、有實際變現成績的短影音操盤手。
你懂流量邏輯、演算法偏好、人性心理、商業變現。

核心原則：
1. 口語化優先：台灣人日常講話的方式，不要書面語、不要官腔
2. 每句話都有存在的理由：30–60秒的影片，每一秒都珍貴，沒有廢話
3. 開場3秒定生死：觀眾在0.5秒內決定要不要繼續看，前三秒必須讓人停下來
4. 完播率是最重要指標：虎頭豹尾，全片零尿點，結尾急收

輸出格式：
【影片主題】一句話描述
【目標秒數】30–60 秒
【開場模式】提問式/爆點先行/創造衝突/破格式/場景帶入

---

【開場】
（前3秒台詞）

【中段】
（核心內容台詞）

【反轉】
（出乎意料的轉折台詞）

【結尾】
（收情緒台詞 + CTA）

只輸出台詞，不標景別，不加畫面建議。`;

  const userPrompt = `帳號類型：${type}
發布平台：${platform}
說話風格：${style}
影片主題：${topic}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1000
      })
    });
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '生成失敗，請再試一次。';
    res.status(200).json({ result: text });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
