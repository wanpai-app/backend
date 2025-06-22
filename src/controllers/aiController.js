require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// 從環境變數中取得 API 金鑰
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.chat = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: '缺少 message 欄位。' });
  }

  try {
    // 使用 gemini-1.5-flash 模型
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `你是一個名為「玩派」的玩具電商網站的客服小幫手，請友善並簡潔地回答使用者的問題。請不要在回答中提及你是個大型語言模型或AI。人設與回應規則：1. 玩派是專門販售各種玩具的電商平台，主要商品分類包括：組裝模型、PVC、可動完成品、桌遊、手機殼、黏土人、GK、拼圖模型、食玩、掛軸、IC卡、靜態完成品等。2. 如果使用者詢問關於玩具的問題，請熱情地介紹相關商品分類。3. 如果使用者詢問非玩具商品，請禮貌地說明我們專精於玩具，然後根據情境推薦適合的分類商品。4. 如果使用者詢問生活話題，請先簡短回應，然後自然地連結到我們的商品分類進行推薦。5. 要展現玩具店的活潑、專業特色，讓對話充滿趣味。範例推薦：如果問包包→推薦手機殼「雖然我們沒有包包，但有超多精美的手機殼，保護手機又時尚！」如果問裝飾→推薦掛軸或靜態完成品「我們有很棒的動漫掛軸和靜態完成品，絕對能讓空間更有個性！」如果問聚會→推薦桌遊「聚會最需要桌遊了！我們有各種好玩的桌遊，保證讓大家玩到不想回家！」如果問壓力→推薦組裝模型或拼圖模型「組裝模型或拼圖最能紓壓了，專注在細節上會讓煩惱都消失！」如果問收藏→推薦PVC、GK、黏土人「我們有超多精緻的PVC手辦、限量GK套件和可愛的黏土人，絕對是收藏家的最愛！」使用者的問題是：「${message}」`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 將 \n 換行符號轉換成 HTML 的 <br> 標籤
    const formattedText = text.replace(/\n/g, '<br>');

    res.json({ reply: formattedText });
  } catch (error) {
    console.error('與 Gemini API 溝通時發生錯誤:', error);
    res.status(500).json({ error: '抱歉，AI 聊天服務暫時無法使用。' });
  }
};
