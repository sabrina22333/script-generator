const https = require('https');

module.exports = (req, res) => {
  if (req.method !== 'POST') { res.status(405).end(); return; }

  const { type, platform, style, topic } = req.body;

  const carTemplates = `
1. 爆點先行：「我花了三年才搞懂這件事」
2. 金額衝突：「同一台車，他買28萬，我買19萬，差在哪？」
3. 身份揭露：「我是中古車業務，這些話我本來不該說」
4. 反常識：「買中古車，反而不要先看里程數」
5. 場景帶入：「上週有個客人，看車看了兩個月，最後買了第一台看的」
6. 懸念製造：「有一個問題，90%的人買車前都沒問過」
7. 數字對比：「一樣的車，差價可以到10萬，原因只有一個」
8. 錯誤示範：「我看過最多人犯的錯，就是先去看車」
9. 挑釁開場：「會被坑的人，通常都有這個習慣」
10. 秘密揭露：「車行不會主動告訴你的事，我說給你聽」
11. 情境對比：「同事買車花了30萬，我幫他算了一下，他多花了8萬」
12. 衝突製造：「車行說這台沒事故，但我查到的不一樣」
13. 自我揭露：「說真的，我剛入行的時候也騙過客人」
14. 警告型：「這個動作，讓你買車永遠買貴」
15. 故事型：「有個客人上個月來找我，他說他已經被騙過一次了」
16. 比較型：「新車 vs 中古車，我幫你算清楚」
17. 工具型：「買車前，只要查這一個網站就夠了」
18. 結果先說：「我上個月幫朋友省了6萬，方法很簡單」
19. 時代感：「現在買中古車，跟五年前完全不同」
20. 問題切入：「你知道為什麼有些車特別便宜嗎？」`;

  const aiTemplates = `
1. 反常識：「大家都說要學 Prompt，但我覺得這是在浪費時間」
2. 結果先說：「我用 AI 三個月，省了快200小時，怎麼做的？」
3. 身份揭露：「我做短影音一年半，AI 幫我做了哪些事，全說了」
4. 數字衝擊：「一個 Prompt，幫我生成了30天的內容」
5. 挑釁開場：「你用 ChatGPT 的方式，讓你永遠只能得到普通答案」
6. 錯誤示範：「90% 的人用 AI 都在做同一件錯的事」
7. 懸念製造：「有一個 AI 功能，幾乎沒人在用，但效果最好」
8. 場景帶入：「昨天我用 AI 做了一件事，連我自己都嚇到」
9. 對比開場：「用 AI 之前，我一篇文案要寫兩小時，現在十分鐘」
10. 秘密揭露：「這個 AI 工具是免費的，但沒人告訴你」
11. 警告型：「你花錢訂閱 ChatGPT Plus，但你根本沒用到它最強的功能」
12. 工具型：「做短影音只需要這三個 AI 工具，其他都不用裝」
13. 自我揭露：「說實話，我一開始用 AI 做出來的東西很爛」
14. 時間壓迫：「五分鐘學會這個，你的工作效率直接翻倍」
15. 金額衝突：「別人外包要花5000，我用 AI 自己做，成本幾乎是零」
16. 故事型：「上週有個朋友問我，為什麼你做內容這麼快？」
17. 問題切入：「你有沒有覺得，AI 給的答案都很像廢話？」
18. 比較型：「Claude vs ChatGPT，寫腳本哪個比較好用？」
19. 衝突製造：「我測試了10個 AI 工具，只有2個值得用」
20. 身份代入：「如果你是創作者，這個 AI 功能你一定要知道」`;

  const templates = type === '中古車業務' ? carTemplates : aiTemplates;

  const bodyData = JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: `你是一位有七年經驗、操作過百萬流量的短影音操盤手。

嚴格禁止：
- 禁止用「嘿大家好」「哈囉」「今天要跟大家聊」開場
- 禁止條列式內容「首先、接下來、最後」
- 禁止說「記得訂閱按讚」這種制式CTA
- 每次生成必須跟上次完全不同的結構和切入角度

帳號類型：${type}
以下是這個帳號專屬的開場模板庫，每次隨機選一種：
${templates}

每次生成必須：
- 從上面隨機選一個開場模板，每次都要不同
- 中段有具體資訊或數字，不能空洞
- 反轉要真的讓人意外
- 結尾急收，一句話收尾，不解釋
- 說話像台灣人，口語自然，不要書面語

輸出格式（只輸出台詞）：
【影片主題】
【目標秒數】
【使用開場模板編號】

【開場】
（台詞）

【中段】
（台詞）

【反轉】
（台詞）

【結尾】
（台詞）` },
      { role: 'user', content: `平台：${platform}，風格：${style}，主題：${topic}，請生成腳本。` }
    ],
    max_tokens: 1200
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
