require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../configs/db');
const { productsTable } = require('../models/productSchema');
const { productImagesTable } = require('../models/productImageSchema');
// 注意：tagsTable, typeEnum, productTagSTable 在 services 中使用，不要移除相關 imports
const { eq, and, ilike, inArray } = require('drizzle-orm');

// 導入 services
// const productSearchService = require('../services/ai/productSearchService'); // 在 smartSearchService 內部使用
// const recommendationService = require('../services/ai/recommendationService'); // 在 smartSearchService 內部使用
const smartSearchService = require('../services/ai/smartSearchService');
const textProcessingService = require('../services/ai/textProcessingService');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 使用 textProcessingService 中的函數
const extractProductKeywords = textProcessingService.extractProductKeywords;

// 使用 textProcessingService 中的函數
const extractRequestedQuantity = textProcessingService.extractRequestedQuantity;

// 注意：以下函數在 services 內部使用，保留引用以避免模組載入錯誤
// const searchProductsByName = productSearchService.searchProductsByName;
// const searchProductsByTags = productSearchService.searchProductsByTags;
// const getRandomProductsFromDB = productSearchService.getRandomProductsFromDB;

const generateProductUrl = (productId) => {
  const frontendUrl = process.env.FRONTEND_URL || 'https://wanpai-frontend.zeabur.app';
  return `${frontendUrl}/products/${productId}`;
};

// const generateRandomRecommendation = recommendationService.generateRandomRecommendation;

// 使用 textProcessingService 中的函數
const checkForProductRecommendationQuery = textProcessingService.checkForProductRecommendationQuery;
// const checkForDirectRecommendationQuery = textProcessingService.checkForDirectRecommendationQuery;
const checkForMoreProductsQuery = textProcessingService.checkForMoreProductsQuery;

// 快速商品查詢函數
const getProducts = async (query = null) => {
  try {
    let dbQuery = db.select().from(productsTable).orderBy(productsTable.id);

    // 只顯示活躍且未刪除的商品
    if (query) {
      dbQuery = dbQuery.where(
        and(
          eq(productsTable.isDeleted, false),
          eq(productsTable.status, 'active'),
          ilike(productsTable.name, `%${query}%`)
        )
      );
    } else {
      dbQuery = dbQuery.where(
        and(eq(productsTable.isDeleted, false), eq(productsTable.status, 'active'))
      );
    }

    const products = await dbQuery.limit(20);

    if (products.length === 0) return [];

    const productIds = products.map((p) => p.id);

    // 獲取封面圖片
    const coverImages = await db
      .select({
        productId: productImagesTable.productId,
        imgUrl: productImagesTable.imgUrl,
      })
      .from(productImagesTable)
      .where(
        and(inArray(productImagesTable.productId, productIds), eq(productImagesTable.isCover, true))
      );

    const coverMap = new Map();
    for (const img of coverImages) {
      coverMap.set(img.productId, img.imgUrl);
    }

    const productsWithCovers = products.map((p) => ({
      ...p,
      coverImage: coverMap.get(p.id) || null,
    }));

    return productsWithCovers;
  } catch (error) {
    error;
    return [];
  }
};

// 生成推薦邏輯
// 清理商品描述函數
const cleanProductDescription = (description) => {
  if (!description) return '';

  // 移除HTML標籤
  let cleanText = description.replace(/<[^>]+>/g, '');

  // 定義要移除的模式
  const removePatterns = [
    // 圖片聲明
    /※圖片為塗裝完成品，實際商品可能會與照片有異※/g,
    /※本商品為組裝模型\(成形色\)，需自行組裝、上色※/g,
    /※本商品為組裝模型，需自行組裝、上色※/g,
    /※圖片為示意圖，實際商品可能與照片有異※/g,
    /※實際商品可能會與照片有異※/g,

    // 商品類型聲明
    /商品廠牌[^\n]*\n?/g,
    /商品名稱[^\n]*\n?/g,
    /商品類型[^\n]*\n?/g,
    /商品說明[^\n]*\n?/g,

    // 注意事項
    /收到商品時請先透過塑膠膜檢查外觀塗裝以及配件完整性[^。]*。?/g,
    /瑕疵及缺件案件需與廠商回報辦理[^。]*。?/g,
    /如包裝完整較能成案[^。]*。?/g,
    /如非拆封[^。]*。?/g,
    /下單注意事項[^●]*●?/g,
    /現貨與預購商品請勿合併於同一張[^。]*。?/g,

    // 多餘的符號和空白
    /&nbsp;/g,
    /\s+/g, // 多個空白替換為單個空白
    /^[。、，\s]+|[。、，\s]+$/g, // 移除開頭和結尾的標點符號和空白
  ];

  // 逐一移除不需要的內容
  removePatterns.forEach((pattern) => {
    cleanText = cleanText.replace(pattern, '');
  });

  // 進一步清理：移除連續的特殊字符
  cleanText = cleanText
    .replace(/[※。、，\s]+/g, ' ') // 移除連續的特殊字符
    .replace(/^\s+|\s+$/g, '') // 移除首尾空白
    .replace(/\s+/g, ' '); // 多個空白合併為一個

  // 如果清理後太短或只剩下一些無意義的字符，返回空字符串
  if (cleanText.length < 10 || /^[※。、，\s\d]+$/.test(cleanText)) {
    return '';
  }

  // 限制長度並確保完整句子
  if (cleanText.length > 60) {
    cleanText = cleanText.substring(0, 60);
    // 嘗試在合適的位置截斷
    const lastSpace = cleanText.lastIndexOf(' ');
    const lastPunctuation = Math.max(
      cleanText.lastIndexOf('。'),
      cleanText.lastIndexOf('，'),
      cleanText.lastIndexOf('、')
    );

    if (lastPunctuation > 30) {
      cleanText = cleanText.substring(0, lastPunctuation + 1);
    } else if (lastSpace > 30) {
      cleanText = cleanText.substring(0, lastSpace);
    }
  }

  return cleanText.trim();
};

const generateRecommendation = async (searchResult) => {
  const { products, searchType, searchKeyword, searchTypeDisplay, isSeriesRecommendation } =
    searchResult;

  if (!products || products.length === 0) {
    return '';
  }

  let recommendationText = '';

  // 檢查是否為通用商品查詢（直接推薦，不顯示「找到」字樣）
  const isGeneralQuery = ['商品', '產品', '玩具', '模型', '手辦', '公仔'].includes(searchKeyword);

  // 根據搜尋類型產生不同的標題訊息
  switch (searchType) {
    case 'ip':
      recommendationText = `\n\n🎯 找到 ${searchTypeDisplay}「${searchKeyword}」的商品：\n\n`;
      break;
    case 'brand':
      recommendationText = `\n\n🏭 找到 ${searchTypeDisplay}「${searchKeyword}」的商品：\n\n`;
      break;
    case 'series':
      if (isSeriesRecommendation) {
        recommendationText = `\n\n🎲 為您推薦「${searchKeyword}」系列的精選商品：\n\n`;
      } else {
        recommendationText = `\n\n📺 找到 ${searchTypeDisplay}「${searchKeyword}」的商品：\n\n`;
      }
      break;
    case 'name':
      if (isGeneralQuery) {
        recommendationText = `\n\n🎯 為您推薦熱門商品：\n\n`;
      } else {
        recommendationText = `\n\n🎯 找到與「${searchKeyword}」相關的商品：\n\n`;
      }
      break;
    case 'fuzzy':
      if (isGeneralQuery) {
        recommendationText = `\n\n🎯 為您推薦熱門商品：\n\n`;
      } else {
        recommendationText = `\n\n🔍 找到與「${searchKeyword}」相關的商品：\n\n`;
      }
      break;
    case 'tag':
      recommendationText = `\n\n🏷️ 找到「${searchKeyword}」系列的商品：\n\n`;
      break;
    case 'random':
      recommendationText = '\n\n🎯 為您推薦我們店內的熱門商品：\n\n';
      break;
    default:
      recommendationText = '\n\n🎯 為您推薦：\n\n';
  }

  // 顯示商品（如果是隨機推薦，已經在 smartSearch 中篩選過，這裡直接使用）
  const selected =
    searchType === 'random' ? products : products.slice(0, Math.min(8, products.length));

  selected.forEach((product, index) => {
    const productUrl = generateProductUrl(product.id);
    const productName = product.productName || product.name || '未知商品';
    recommendationText += `${index + 1}. ${productName}\n`;
    recommendationText += `💰 價格：NT$ ${product.price}\n`;

    // 使用新的清理函數處理商品描述
    if (product.description) {
      const cleanDescription = cleanProductDescription(product.description);
      if (cleanDescription) {
        recommendationText += `📝 ${cleanDescription}...\n`;
      }
    }

    recommendationText += `🔗 <a href="${productUrl}" target="_blank" style="color: #007bff; text-decoration: none; word-break: break-all;">查看詳情</a>\n`;
    recommendationText += '\n';
  });

  return recommendationText;
};

// 智能搜尋邏輯 - 以下函數在 services 內部使用
// const searchByTagType = productSearchService.searchByTagType;
// const fuzzySearchProducts = productSearchService.fuzzySearchProducts;
// const searchSeriesProducts = productSearchService.searchSeriesProducts;

const smartSearch = smartSearchService.smartSearch;

// 主要聊天函數
exports.chat = async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: '缺少 message 欄位。' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // 特殊處理：檢查是否搜尋「獵人」
    const isHunterQuery = /^獵人$|hunter$/i.test(message.trim());
    if (isHunterQuery) {
      return res.json({
        reply:
          '很抱歉，我們沒有《獵人》系列的商品。不過我們有《魔物獵人》的相關商品，如果您有興趣的話可以搜尋「魔物獵人」。<br><br>🔍 您也可以瀏覽我們其他的商品系列！',
      });
    }

    // 檢查是否為商品相關查詢（根據實際商品調整關鍵詞）
    const isProductQuery =
      /商品|產品|推薦|購買|價格|有什麼|想要|需要|找|搜尋|公仔|手辦|模型|玩具|鋼彈|變形金剛|河馬|無職轉生|遊戲王|數碼寶貝|初音未來|假面騎士|哥吉拉|精靈寶可夢|overlord|魔物獵人|葬送|芙莉蓮|烙印勇士|孤獨搖滾|狼與辛香料|蔚藍檔案|超人力霸王|犬夜叉|莉可麗絲|魔神|女神異聞錄|史努比|崩壞|星穹鐵道|熊熊遇見你|瑞克和莫蒂|探險活寶|hololive|夢想成為魔法少女|環太平洋|絕區零|物語系列|妮姬|我的英雄學院|厲陰宅|牠|組裝模型|PVC|可動完成品|景品|手機架|黏土人|GK|拼圖模型|盒玩|掛軸|IC卡|靜態完成品|完成品|Nendoroid|青島|AOSHIMA|BellFine|TAITO|Good Smile|BANDAI|MegaHouse|KAIYODO|TAKARATOMY|FURYU|Threezero|TOHO|Kotobukiya|RIBOSE|CAPCOM|Design|BANPRESTO|野獸國|MINIGT|QuesQ|Max Factory|BearPanda|Infinity Studio|KADOKAWA|JXK|PROOF|豐田|Toyota|一番賞|PLEX|Re-ment|一卡通|HIROKAWA|Animester/.test(
        message
      );

    // 檢查是否有推薦意圖
    const hasRecommendationIntent = checkForProductRecommendationQuery(message);

    // 檢查是否為要求更多商品的查詢
    const isRequestingMoreProducts = checkForMoreProductsQuery(message);

    // 檢查是否為純一般性商品查詢（沒有特定商品關鍵詞）
    const keywords = extractProductKeywords(message);
    const hasSpecificProduct = keywords.length > 0;

    // 特殊處理：當用戶問一般性商品問題且沒有特定商品需求時，觸發隨機推薦
    const isGeneralProductQuery =
      /有什麼商品|什麼商品|推薦商品|有哪些|推薦什麼|有什麼可以|商品推薦/.test(message) &&
      !hasSpecificProduct;

    const requestedQuantity = extractRequestedQuantity(message);

    let productInfo = '';

    // 優化邏輯順序：優先處理具體商品查詢
    if (isRequestingMoreProducts) {
      // 要求更多商品：直接隨機推薦，不考慮歷史關鍵詞
      const allProducts = await getProducts();
      if (allProducts.length > 0) {
        const shuffled = allProducts.sort(() => 0.5 - Math.random());
        const randomProducts = shuffled.slice(0, Math.min(requestedQuantity, allProducts.length));

        // 添加封面圖片
        const productIds = randomProducts.map((p) => p.id);
        const coverImages = await db
          .select({ productId: productImagesTable.productId, imgUrl: productImagesTable.imgUrl })
          .from(productImagesTable)
          .where(
            and(
              inArray(productImagesTable.productId, productIds),
              eq(productImagesTable.isCover, true)
            )
          );

        const coverMap = new Map(coverImages.map((img) => [img.productId, img.imgUrl]));
        const productsWithCovers = randomProducts.map((p) => ({
          ...p,
          coverImage: coverMap.get(p.id) || null,
        }));

        const searchResult = {
          products: productsWithCovers,
          searchType: 'random',
          searchKeyword: '更多商品',
          requestedQuantity,
        };
        productInfo = await generateRecommendation(searchResult);
      }
    } else if (hasSpecificProduct || isProductQuery) {
      // 有特定商品查詢或是商品相關查詢：直接搜尋
      const searchResult = await smartSearch(message, requestedQuantity);
      productInfo = await generateRecommendation(searchResult);
    } else if (hasRecommendationIntent || isGeneralProductQuery) {
      // 有推薦意圖但沒有特定商品：隨機推薦
      const allProducts = await getProducts();
      if (allProducts.length > 0) {
        const shuffled = allProducts.sort(() => 0.5 - Math.random());
        const randomProducts = shuffled.slice(0, Math.min(requestedQuantity, allProducts.length));

        // 添加封面圖片
        const productIds = randomProducts.map((p) => p.id);
        const coverImages = await db
          .select({ productId: productImagesTable.productId, imgUrl: productImagesTable.imgUrl })
          .from(productImagesTable)
          .where(
            and(
              inArray(productImagesTable.productId, productIds),
              eq(productImagesTable.isCover, true)
            )
          );

        const coverMap = new Map(coverImages.map((img) => [img.productId, img.imgUrl]));
        const productsWithCovers = randomProducts.map((p) => ({
          ...p,
          coverImage: coverMap.get(p.id) || null,
        }));

        const searchResult = {
          products: productsWithCovers,
          searchType: 'random',
          searchKeyword: null,
          requestedQuantity,
        };
        productInfo = await generateRecommendation(searchResult);
      }
    }

    let contextInfo = '';

    // 分析對話歷史，提取上下文
    if (history && history.length > 0) {
      const recentMessages = history.slice(-4); // 取最近4條對話

      // 從歷史中提取商品關鍵詞
      const historyText = recentMessages.map((msg) => msg.content).join(' ');
      const contextKeywords = extractProductKeywords(historyText);

      if (contextKeywords.length > 0) {
        contextInfo = `\n\n對話上下文：用戶之前提到了 ${contextKeywords.join('、')} 相關內容`;
      }
    }

    let searchInfo = '';
    let hasFoundProducts = false;

    if (
      (isProductQuery || isGeneralProductQuery || isRequestingMoreProducts || hasSpecificProduct) &&
      productInfo
    ) {
      if (isRequestingMoreProducts) {
        hasFoundProducts = true;
        searchInfo =
          '\n\n【重要】：客戶要求更多商品，系統提供了新的商品推薦，請表達為客戶推薦更多商品選擇。';
      } else if (
        productInfo.includes('🎯 找到與') ||
        productInfo.includes('🎯 找到 IP系列') ||
        productInfo.includes('🏭 找到 品牌') ||
        productInfo.includes('📺 找到 系列') ||
        productInfo.includes('🏷️ 找到「')
      ) {
        hasFoundProducts = true;
        searchInfo = '\n\n【重要】：系統成功找到了相關商品，請簡單確認找到商品即可，不要說推薦。';
      } else if (
        productInfo.includes('🎯 為您推薦我們店內的熱門商品') ||
        productInfo.includes('🎯 為您推薦熱門商品')
      ) {
        hasFoundProducts = true;
        searchInfo = '\n\n【重要】：系統提供了熱門商品推薦，請表達為客戶推薦商品，不要說沒有找到。';
      } else if (productInfo.includes('🎲 為您推薦「')) {
        hasFoundProducts = true;
        searchInfo = '\n\n【重要】：系統找到了系列商品並提供推薦，請表達找到相關系列商品。';
      } else {
        hasFoundProducts = true;
        searchInfo = '\n\n【重要】：系統提供了其他推薦商品，請表達為客戶推薦其他商品。';
      }
    }

    const prompt = `你是玩派玩具店的專業客服，專門幫助客戶找到他們想要的模型玩具。

【語言要求 - 最重要】：
- 必須使用正體中文（繁體中文）回應
- 絕對禁止使用簡體字，例如：不能用「查看」要用「檢視」、不能用「动漫」要用「動漫」
- 所有回應必須符合台灣用語習慣

【標籤系統理解】：
我們的商品按照三種標籤分類：
1. IP系列（智慧財產權）：如鋼彈、變形金剛、無職轉生、遊戲王、河馬、數碼寶貝、初音未來、假面騎士、哥吉拉、精靈寶可夢等角色作品
2. 品牌（brand）：如BANDAI、TAITO、Good Smile、MegaHouse、Kotobukiya、TAKARATOMY等製造商
3. 系列（series）：如組裝模型、PVC、可動完成品、景品、黏土人、GK等產品線

【系列查詢處理】：
當客戶詢問「組裝模型」「PVC」「景品」「黏土人」「可動完成品」等系列時，系統會自動推薦該系列的精選商品。

【絕對禁止事項】：
1. 【最嚴重違規】絕對嚴禁使用任何簡體字或大陸用語
2. 絕對不要編造任何商品資訊、系列名稱、公司名稱
3. 禁止提及我們沒有的商品系列（如：航海王、火影忍者、七龍珠、海賊王、死神、MG、RG、PG、HG等級別分類）
4. 禁止描述具體的商品功能、特色或規格
5. 禁止舉例說明不存在的商品型號或系列
6. 不要問使用者偏好什麼系列或機體，因為我們可能沒有
7. 絕對不要在回應中出現「[連結1]」「[連結2]」等技術性佔位符
8. 不要在AI回應中重複顯示商品推薦，因為系統會自動添加商品清單
9. 【重要】絕對禁止提及任何具體的動漫作品名稱，只能說「相關商品」或「熱門商品」

【正體中文用詞規範】：
- 使用「檢視」而非「查看」
- 使用「動漫」而非「动漫」
- 使用「資訊」而非「信息」
- 使用「軟體」而非「软件」
- 使用「網站」而非「网站」
- 使用「聯繫」而非「联系」

【必須遵守】：
1. AI回應要簡潔自然，不要提及商品清單或連結
2. 系統會自動在AI回應後添加相關商品推薦
3. 根據搜尋結果回應：
   - 如果系統找到商品：表達找到了相關商品，不要說沒有
   - 如果系統沒找到：才說沒有找到，並建議其他選擇
4. 【強制要求】使用正體中文（繁體中文）回應，符合台灣用語習慣
5. 不要在回應中重複說明商品內容，因為下方會有詳細商品資訊

【回應格式】：
${
  hasFoundProducts
    ? isRequestingMoreProducts
      ? '- 要求更多商品時：請說"當然！為您推薦更多精選商品"或"還有這些商品供您參考"'
      : productInfo &&
          (productInfo.includes('🎯 為您推薦我們店內的熱門商品') ||
            productInfo.includes('🎯 為您推薦熱門商品'))
        ? '- 熱門商品推薦時：請說"為您推薦熱門商品"'
        : productInfo && productInfo.includes('🎲 為您推薦「')
          ? '- 系列商品推薦時：請說"這個系列有很多精選商品，為您推薦幾款"'
          : productInfo &&
              (productInfo.includes('🎯 找到與') ||
                productInfo.includes('🎯 找到 IP系列') ||
                productInfo.includes('🏭 找到 品牌') ||
                productInfo.includes('📺 找到 系列'))
            ? '- 找到特定商品時：簡單確認即可，如"找到相關商品"'
            : '- 沒找到特定商品但有推薦時：說"很抱歉沒有找到特定商品，不過為您推薦其他商品"'
    : '- 完全沒找到時：說"很抱歉沒有找到相關商品，請您瀏覽其他商品"'
}
- 不要提及連結、清單或具體商品名稱
- 回應要自然友善，展現專業客服態度${contextInfo}${searchInfo}`;

    const result = await model.generateContent(prompt + `\n\n使用者問題：「${message}」`);
    const response = await result.response;
    let aiResponse = response.text();

    // 分別處理AI回應和商品信息的換行符轉換
    const formattedText = aiResponse.replace(/\n/g, '<br>');

    // 對商品信息進行特殊處理，避免破壞HTML標籤
    let formattedProductInfo = '';
    if (productInfo) {
      // 先保護HTML標籤，然後轉換換行符
      formattedProductInfo = productInfo
        .replace(/<a\s+[^>]*href="[^"]*"[^>]*>.*?<\/a>/g, (match) => {
          // 保護a標籤不被換行符影響
          return match.replace(/\n/g, '');
        })
        .replace(/\n/g, '<br>');
    }

    const finalResponse = formattedText + formattedProductInfo;

    res.json({ reply: finalResponse });
  } catch {
    res.status(500).json({ error: '抱歉，我現在無法處理您的請求。請稍後再試。' });
  }
};
