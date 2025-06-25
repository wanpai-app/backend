require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../configs/db');
const { productsTable } = require('../models/productSchema');
const { productImagesTable } = require('../models/productImageSchema');
const { tagsTable, typeEnum } = require('../models/tagsSchema');
const { productTagSTable } = require('../models/productTagSchema');
const { eq, and, ilike, inArray } = require('drizzle-orm');
const axios = require('axios');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getProductsFromAPI = async () => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const response = await axios.get(`${baseUrl}/api/products`);
    return response.data;
  } catch (error) {
    return [];
  }
};

const getFilterTagsFromAPI = async () => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const response = await axios.get(`${baseUrl}/api/tags/filter`);
    return response.data;
  } catch (error) {
    return [];
  }
};

const getProductsByTagnamesFromAPI = async (tagnames) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const response = await axios.get(`${baseUrl}/api/tags/filterByTagnames`, {
      params: { tagnames: tagnames.join(',') },
    });
    return response.data;
  } catch (error) {
    return [];
  }
};

const extractProductKeywords = (message) => {
  const productKeywords = [
    '鋼彈',
    '高達',
    'GUNDAM',
    'gundam',
    'Gundam',
    '變形金剛',
    '柯博文',
    '大黃蜂',
    '無職轉生',
    '魯迪烏斯',
    '艾莉絲',
    '希爾菲',
    '遊戲王',
    'Yu-Gi-Oh',
    '百獸王',
    'GOLION',
    '河馬',
    'hippo',
    '閃電霹靂車',
    '數碼寶貝',
    'Digimon',
    '藍寶堅尼',
    'Lamborghini',
    '初音未來',
    'Hatsune Miku',
    'Miku',
    '假面騎士',
    'Kamen Rider',
    '哥吉拉',
    'Godzilla',
    '精靈寶可夢',
    '寶可夢',
    '皮卡丘',
    'Pokemon',
    'pokemon',
    '魔物獵人',
    'Monster Hunter',
    'Overlord',
    'overlord',
    '雅兒貝德',
    '安茲',
    '孤獨搖滾',
    '狼與辛香料',
    '蔚藍檔案',
    'Blue Archive',
    '超人力霸王',
    'Ultraman',
    '犬夜叉',
    'Inuyasha',
    '莉可麗絲',
    'LycoReco',
    '魔神Z',
    'Mazinger Z',
    '女神異聞錄',
    'Persona',
    '史努比',
    'Snoopy',
    '崩壞:星穹鐵道',
    '星穹鐵道',
    '熊熊遇見你',
    'We Bare Bears',
    '瑞克和莫蒂',
    'Rick and Morty',
    '探險活寶',
    'Adventure Time',
    'hololive',
    '夢想成為魔法少女',
    '環太平洋',
    'Pacific Rim',
    '絕區零',
    'Zenless Zone Zero',
    '物語系列',
    'Monogatari',
    '勝利女神：妮姬',
    'NIKKE',
    '妮姬',
    '我的英雄學院',
    'My Hero Academia',
    '葬送的芙莉蓮',
    '芙莉蓮',
    'frieren',
    'Frieren',
    '葬送',
    '芙利蓮',
    '烙印勇士',
    'Berserk',
    '納蘭詞',
    '公仔',
    '手辦',
    '模型',
    '組裝模型',
    'PVC',
    '可動完成品',
    '景品',
    '手機架',
    '黏土人',
    'Nendoroid',
    'nendoroid',
    'GK',
    '拼圖模型',
    '盒玩',
    '掛軸',
    'IC卡',
    '靜態完成品',
    '完成品',
  ];

  const patterns = [
    /想買(.+?)(?:的|玩具|模型|商品|手辦|周邊|公仔|$)/g,
    /想要(.+?)(?:的|玩具|模型|商品|手辦|周邊|公仔|$)/g,
    /找(.+?)(?:的|玩具|模型|商品|手辦|周邊|公仔|$)/g,
    /有沒有(.+?)(?:的|玩具|模型|商品|手辦|周邊|公仔|嗎|$)/g,
    /有(.+?)(?:玩具|模型|商品|手辦|周邊|公仔|嗎|$)/g,
    /喜歡(.+?)(?:的|玩具|模型|商品|手辦|周邊|公仔|$)/g,
    /推薦(.+?)(?:的|玩具|模型|商品|手辦|周邊|公仔|$)/g,
    /(.+?)商品/g,
    /(.+?)系列/g,
  ];

  let keywords = [];

  // 先檢查是否包含已知商品關鍵詞
  for (const keyword of productKeywords) {
    if (message.includes(keyword)) {
      keywords.push(keyword);
    }
  }

  // 如果沒找到已知關鍵詞，用模式匹配
  if (keywords.length === 0) {
    for (const pattern of patterns) {
      const matches = [...message.matchAll(pattern)];
      if (matches.length > 0) {
        keywords = matches
          .map((match) => {
            let keyword = match[1].trim();
            keyword = keyword.replace(/相關的?|類似的?|之類的?|等等?$/g, '').trim();
            return keyword;
          })
          .filter((word) => word.length > 0)
          .filter(
            (word) =>
              ![
                '我',
                '想',
                '要',
                '買',
                '找',
                '搜尋',
                '搜索',
                '查詢',
                '有沒有',
                '推薦',
                '什麼',
                '哪個',
              ].includes(word)
          );
        if (keywords.length > 0) break;
      }
    }
  }

  // 最後備案：分詞提取
  if (keywords.length === 0) {
    const stopWords = [
      '我',
      '想',
      '要',
      '買',
      '找',
      '搜尋',
      '搜索',
      '查詢',
      '有沒有',
      '推薦',
      '的',
      '個',
      '一',
      '這',
      '那',
      '什麼',
      '哪',
      '裡',
      '嗎',
      '呢',
      '啊',
      '喔',
      '哦',
      '玩具',
      '模型',
      '商品',
      '手辦',
      '周邊',
      '相關',
      '類似',
      '之類',
      '等等',
      '系列',
      '有',
      '請',
      '給',
      '幫',
      '介紹',
      '看看',
    ];

    // 更靈活的分詞提取
    let words = message
      .replace(/[，。！？、；：「」『』（）()]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 0 && !stopWords.includes(word));

    // 如果有單字元詞彙，嘗試組合成更有意義的詞彙
    if (words.some((word) => word.length === 1)) {
      const combinedWords = [];
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        if (word.length === 1 && i < words.length - 1) {
          // 嘗試與下一個字組合
          const combined = word + words[i + 1];
          if (combined.length >= 2) {
            combinedWords.push(combined);
            i++; // 跳過下一個字
            continue;
          }
        }
        if (word.length > 1) {
          combinedWords.push(word);
        }
      }
      words = combinedWords;
    }

    keywords = words.filter((word) => word.length >= 1);
  }

  keywords = keywords.filter((keyword) => {
    if (keyword === '獵人' || keyword.toLowerCase() === 'hunter') {
      return false;
    }
    return true;
  });

  return keywords.slice(0, 3);
};

const extractRequestedQuantity = (message) => {
  const quantityPatterns = [
    /推薦(\d+)個/,
    /要(\d+)個/,
    /給我(\d+)個/,
    /(\d+)個商品/,
    /(\d+)樣商品/,
    /(\d+)種商品/,
    /推薦(.{1,3}?)個/,
    /要(.{1,3}?)個/,
    /給我(.{1,3}?)個/,
  ];

  const chineseNumbers = {
    一: 1,
    二: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9,
    十: 10,
    兩: 2,
    幾: 3,
  };

  for (const pattern of quantityPatterns) {
    const match = message.match(pattern);
    if (match) {
      const quantityStr = match[1];
      if (/^\d+$/.test(quantityStr)) {
        const num = parseInt(quantityStr);
        return Math.min(Math.max(num, 1), 10);
      }

      if (chineseNumbers[quantityStr]) {
        return chineseNumbers[quantityStr];
      }
    }
  }

  return 3; // 預設推薦3個
};

// 改進的商品搜尋功能
const searchProductsByName = async (keyword) => {
  try {
    // 特殊處理：避免「獵人」單獨匹配到「魔物獵人」
    if (keyword === '獵人' || keyword.toLowerCase() === 'hunter') {
      return [];
    }

    // 根據實際資料表建立關鍵詞映射表
    const keywordMapping = {
      // IP 系列
      變形金剛: ['變形金剛', 'Transformer', '柯博文', '大黃蜂'],
      無職轉生: ['無職轉生', '無職轉生～到了異世界就拿出真本事～', '魯迪烏斯', '艾莉絲', '希爾菲'],
      遊戲王: ['遊戲王', 'Yu-Gi-Oh'],
      百獸王: ['百獸王', 'GOLION', '百獸王GOLION'],
      河馬: ['河馬', 'hippo'],
      閃電霹靂車: ['閃電霹靂車'],
      數碼寶貝: ['數碼寶貝', 'Digimon'],
      藍寶堅尼: ['藍寶堅尼', 'Lamborghini', 'Aventador', 'Huracan', 'Huracán'],
      'R35 GT-R': ['R35', 'GT-R', 'GTR'],
      'KENMARY WORKS': ['KENMARY WORKS'],
      'VERTEX JZS161 Aristo': ['VERTEX JZS161 Aristo', 'Aristo'],
      RE雨宮: ['RE雨宮'],
      'Secret BNR34 Skyline GT-R': ['Secret BNR34', 'Skyline GT-R', 'BNR34'],
      'Greddy&Rocket Bunny Enkei': ['Greddy', 'Rocket Bunny', 'Enkei'],
      福斯金龜車: ['福斯金龜車', 'Volkswagen'],
      孤獨搖滾: ['孤獨搖滾'],
      狼與辛香料: ['狼與辛香料'],
      魔物獵人: ['魔物獵人', 'Monster Hunter', 'MonsterHunter'],
      Overlord: ['Overlord', 'overlord', '雅兒貝德', '安茲'],
      魔女之旅: ['魔女之旅'],
      不時輕聲地以俄語遮羞的鄰座艾莉同學: ['不時輕聲地以俄語遮羞的鄰座艾莉同學', '艾莉同學'],
      初音未來: ['初音未來', 'Hatsune Miku', 'Miku'],
      假面騎士: ['假面騎士', 'Kamen Rider'],
      約會大作戰: ['約會大作戰', 'Date A Live'],
      PANDEM: ['PANDEM'],
      蔚藍檔案: ['蔚藍檔案', 'Blue Archive'],
      超人力霸王: ['超人力霸王', 'Ultraman'],
      犬夜叉: ['犬夜叉', 'Inuyasha'],
      '3式機龍': ['3式機龍'],
      車庫拍攝: ['車庫拍攝'],
      莉可麗絲: ['莉可麗絲', 'LycoReco'],
      哥吉拉: ['哥吉拉', 'Godzilla'],
      魔神Z: ['魔神Z', 'Mazinger Z'],
      女神異聞錄: ['女神異聞錄', 'Persona'],
      精靈寶可夢: ['精靈寶可夢', 'Pokemon', '寶可夢', '皮卡丘'],
      史努比: ['史努比', 'Snoopy'],
      超力戰隊王連者: ['超力戰隊王連者'],
      '崩壞:星穹鐵道': ['崩壞:星穹鐵道', '星穹鐵道', 'Honkai Star Rail'],
      熊熊遇見你: ['熊熊遇見你', 'We Bare Bears'],
      瑞克和莫蒂: ['瑞克和莫蒂', 'Rick and Morty'],
      探險活寶: ['探險活寶', 'Adventure Time'],
      IRENA: ['IRENA'],
      '魅魔 風紀委員': ['魅魔', '風紀委員'],
      月刊少女野崎同學: ['月刊少女野崎同學', '野崎同學'],
      hololive: ['hololive'],
      夢想成為魔法少女: ['夢想成為魔法少女'],
      鋼彈: ['鋼彈', '高達', 'GUNDAM', 'gundam', 'Gundam'],
      納蘭詞: ['納蘭詞'],
      環太平洋: ['環太平洋', 'Pacific Rim'],
      虎甲人: ['虎甲人'],
      倒牛奶的女僕: ['倒牛奶的女僕'],
      絕區零: ['絕區零', 'Zenless Zone Zero'],
      物語系列: ['物語系列', 'Monogatari'],
      '勝利女神：妮姬': ['勝利女神：妮姬', 'NIKKE', '妮姬'],
      我的英雄學院: ['我的英雄學院', 'My Hero Academia'],
      '厲陰宅 ': ['厲陰宅'],
      牠: ['牠', 'IT'],
      葬送的芙莉蓮: ['葬送的芙莉蓮', '芙莉蓮', 'frieren', 'Frieren', '葬送', '芙利蓮'],
      '日產 Nissan LB-ER34': ['日產', 'Nissan', 'LB-ER34'],
      '布加迪 Bugatti W16': ['布加迪', 'Bugatti', 'W16'],
      '馬自達 Mazda RX-7': ['馬自達', 'Mazda', 'RX-7'],
      '本田 Honda VEZEL': ['本田', 'Honda', 'VEZEL'],
      烙印勇士: ['烙印勇士', 'Berserk'],
      納蘭詞: ['納蘭詞'],

      // 品牌 (brand)
      TAKARATOMY: ['TAKARATOMY', 'TAKARA TOMY', 'takara'],
      MegaHouse: ['MegaHouse', 'megahouse'],
      KAIYODO: ['KAIYODO', 'kaiyodo'],
      'Good Smile': ['Good Smile', 'GoodSmile', 'goodsmile'],
      JXK: ['JXK', 'jxk'],
      BANDAI: ['BANDAI', 'bandai'],
      'AOSHIMA 青島': ['AOSHIMA', '青島', 'aoshima'],
      PROOF: ['PROOF', 'proof'],
      KADOKAWA: ['KADOKAWA', 'kadokawa'],
      'SK JAPAN': ['SK JAPAN', 'sk japan'],
      TAITO: ['TAITO', 'taito'],
      '豐田 Toyota': ['豐田', 'Toyota', 'toyota'],
      FURYU: ['FURYU', 'furyu'],
      Threezero: ['Threezero', 'threezero'],
      TOHO: ['TOHO', 'toho'],
      'WT Minifactory': ['WT Minifactory', 'wt minifactory'],
      BellFine: ['BellFine', 'bellfine'],
      一番賞: ['一番賞'],
      PLEX: ['PLEX', 'plex'],
      Kotobukiya: ['Kotobukiya', 'kotobukiya'],
      'Re-ment': ['Re-ment', 'rement'],
      RIBOSE: ['RIBOSE', 'ribose'],
      CAPCOM: ['CAPCOM', 'capcom'],
      一卡通: ['一卡通'],
      HIROKAWA: ['HIROKAWA', 'hirokawa'],
      Animester: ['Animester', 'animester'],
      Design: ['Design', 'design'],
      BearPanda: ['BearPanda', 'bearpanda'],
      'Infinity Studio': ['Infinity Studio', 'infinity studio'],
      BANPRESTO: ['BANPRESTO', 'banpresto'],
      野獸國: ['野獸國'],
      MINIGT: ['MINIGT', 'minigt'],
      'Hobby JAPAN': ['Hobby JAPAN', 'hobby japan'],
      QuesQ: ['QuesQ', 'quesq'],
      'Max Factory': ['Max Factory', 'max factory'],

      // 系列 (series)
      組裝模型: ['組裝模型', '模型'],
      PVC: ['PVC', 'pvc'],
      可動完成品: ['可動完成品', '完成品'],
      景品: ['景品'],
      手機架: ['手機架'],
      黏土人: ['黏土人', 'Nendoroid'],
      GK: ['GK', 'gk'],
      拼圖模型: ['拼圖模型', '拼圖'],
      盒玩: ['盒玩'],
      掛軸: ['掛軸'],
      IC卡: ['IC卡', 'ic卡'],
      靜態完成品: ['靜態完成品', '靜態'],
    };

    // 找出所有可能的搜尋關鍵詞
    let searchTerms = [keyword];
    for (const [mainKey, variants] of Object.entries(keywordMapping)) {
      // 特殊處理短關鍵詞「牠」，必須完全匹配
      if (mainKey === '牠') {
        if (keyword === '牠' || keyword.toLowerCase() === 'it') {
          searchTerms = [...searchTerms, ...variants];
          break;
        }
        continue;
      }

      // 其他關鍵詞使用雙向檢查：輸入包含變體 或 變體包含輸入
      if (
        variants.some(
          (variant) =>
            keyword.toLowerCase().includes(variant.toLowerCase()) ||
            variant.toLowerCase().includes(keyword.toLowerCase())
        )
      ) {
        searchTerms = [...searchTerms, ...variants];
        break;
      }
    }

    // 移除重複項目
    searchTerms = [...new Set(searchTerms)];

    let products = [];
    let allResults = new Map(); // 用Map避免重複商品

    // 搜尋所有相關關鍵詞，合併結果
    for (const term of searchTerms) {
      const results = await db
        .select()
        .from(productsTable)
        .where(
          and(
            eq(productsTable.isDeleted, false),
            eq(productsTable.status, 'active'),
            ilike(productsTable.name, `%${term}%`)
          )
        )
        .limit(10);

      // 將結果添加到Map中，用ID作為key避免重複
      results.forEach((product) => {
        allResults.set(product.id, product);
      });
    }

    products = Array.from(allResults.values());

    return products;
  } catch (error) {
    console.error('搜尋商品名稱時發生錯誤:', error);
    return [];
  }
};

const searchProductsByTags = async (keyword) => {
  try {
    const matchingTags = await db
      .select()
      .from(tagsTable)
      .where(ilike(tagsTable.tagname, `%${keyword}%`));

    if (matchingTags.length === 0) {
      return [];
    }

    const tagIds = matchingTags.map((tag) => tag.id);
    const productTagRelations = await db
      .select()
      .from(productTagSTable)
      .where(inArray(productTagSTable.tagId, tagIds));

    if (productTagRelations.length === 0) {
      return [];
    }

    const productIds = productTagRelations.map((pt) => pt.productId);
    const products = await db
      .select()
      .from(productsTable)
      .where(
        and(
          eq(productsTable.isDeleted, false),
          eq(productsTable.status, 'active'),
          inArray(productsTable.id, productIds)
        )
      )
      .limit(10);

    return products;
  } catch (error) {
    console.error('搜尋商品標籤時發生錯誤:', error);
    return [];
  }
};

const smartSearchProducts = async (message) => {
  const keywords = extractProductKeywords(message);
  console.log('提取的關鍵詞:', keywords);

  if (keywords.length === 0) {
    return [];
  }

  for (const keyword of keywords) {
    const nameResults = await searchProductsByName(keyword);
    if (nameResults.length > 0) {
      return nameResults;
    }

    const tagResults = await searchProductsByTags(keyword);
    if (tagResults.length > 0) {
      return tagResults;
    }
  }

  return [];
};

// 智能推薦功能
const getRandomProductsFromDB = async () => {
  try {
    const products = await db
      .select()
      .from(productsTable)
      .where(and(eq(productsTable.isDeleted, false), eq(productsTable.status, 'active')))
      .limit(10);

    return products;
  } catch (error) {
    console.error('獲取隨機商品時發生錯誤:', error);
    return [];
  }
};

const generateProductUrl = (productId) => {
  const frontendUrl = process.env.FRONTEND_URL || 'https://wanpai-frontend.zeabur.app';
  return `${frontendUrl}/products/${productId}`;
};

const generateCategoryUrl = () => {
  const frontendUrl = process.env.FRONTEND_URL || 'https://wanpai-frontend.zeabur.app';
  return `${frontendUrl}/`;
};

const generateRandomRecommendation = async () => {
  const products = await getRandomProductsFromDB();
  const categoryUrl = generateCategoryUrl();

  if (products.length === 0) {
    return `\n\n😅 抱歉，目前沒有可推薦的商品，請瀏覽我們的商品頁面。\n\n👉 <a href="${categoryUrl}" target="_blank" style="color: #007bff; text-decoration: none;">瀏覽所有商品</a>`;
  }

  const randomProducts = products.sort(() => 0.5 - Math.random()).slice(0, 3);

  let recommendationText = '\n\n🎯 為您推薦：\n\n';

  randomProducts.forEach((product) => {
    const productUrl = generateProductUrl(product.id);
    recommendationText += `🛍️ ${product.name}\n`;
    recommendationText += `💰 價格：NT$ ${product.price}\n`;
    if (product.description) {
      recommendationText += `📝 ${product.description.substring(0, 50)}${product.description.length > 50 ? '...' : ''}\n`;
    }
    recommendationText += `👉 <a href="${productUrl}" target="_blank" style="color: #007bff; text-decoration: none; word-break: break-all;">查看詳情</a>\n\n`;
  });

  recommendationText += `🔍 <a href="${categoryUrl}" target="_blank" style="color: #007bff; text-decoration: none;">瀏覽更多商品</a>`;

  return recommendationText;
};

// 對話延續功能
const checkForProductRecommendationQuery = (message) => {
  const recommendationPatterns = [
    '推薦',
    '介紹',
    '建議',
    '什麼好',
    '有什麼',
    '買什麼',
    '選什麼',
    '適合',
    '喜歡',
    '想要',
    '想買',
  ];

  return recommendationPatterns.some((pattern) => message.includes(pattern));
};

const checkForDirectRecommendationQuery = (message) => {
  const directPatterns = ['不知道要買什麼', '隨便推薦', '看看有什麼', '有什麼商品', '隨便看看'];

  return directPatterns.some((pattern) => message.includes(pattern));
};

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
    console.error('商品查詢錯誤:', error);
    return [];
  }
};

// 獲取所有商品（用於推薦）
const getAllProducts = async () => {
  try {
    const products = await db
      .select({
        id: productsTable.id,
        name: productsTable.name,
        description: productsTable.description,
        price: productsTable.price,
        stockQuantity: productsTable.stockQuantity,
        category: productsTable.category,
      })
      .from(productsTable)
      .where(eq(productsTable.isDeleted, false))
      .limit(20);

    return products;
  } catch (error) {
    console.error('獲取商品錯誤:', error);
    return [];
  }
};

// 使用現有的getAllFilterTags邏輯
const getFilterTags = async () => {
  try {
    const brands = await db
      .select({
        id: tagsTable.id,
        tagname: tagsTable.tagname,
      })
      .from(tagsTable)
      .where(eq(tagsTable.type, typeEnum.enumValues[1]));

    const series = await db
      .select({
        id: tagsTable.id,
        tagname: tagsTable.tagname,
      })
      .from(tagsTable)
      .where(eq(tagsTable.type, typeEnum.enumValues[2]));

    const ip = await db
      .select({
        id: tagsTable.id,
        tagname: tagsTable.tagname,
      })
      .from(tagsTable)
      .where(eq(tagsTable.type, typeEnum.enumValues[0]));

    return { brands, series, ip };
  } catch (error) {
    console.error('獲取標籤錯誤:', error);
    return { brands: [], series: [], ip: [] };
  }
};

// 使用現有的getProductsByTagnames邏輯
const getProductsByTag = async (tagname) => {
  try {
    const tags = await db
      .select({ id: tagsTable.id })
      .from(tagsTable)
      .where(eq(tagsTable.tagname, tagname));

    if (tags.length === 0) return [];

    const tagId = tags[0].id;

    const productTagLinks = await db
      .select({ productId: productTagSTable.productId })
      .from(productTagSTable)
      .where(eq(productTagSTable.tagId, tagId));

    if (productTagLinks.length === 0) return [];

    const productIds = productTagLinks.map((p) => p.productId);

    const products = await db
      .select()
      .from(productsTable)
      .where(and(inArray(productsTable.id, productIds), eq(productsTable.status, 'active')));

    if (products.length === 0) return [];

    const activeProductIds = products.map((p) => p.id);
    const coverImages = await db
      .select({ productId: productImagesTable.productId, imgUrl: productImagesTable.imgUrl })
      .from(productImagesTable)
      .where(
        and(
          inArray(productImagesTable.productId, activeProductIds),
          eq(productImagesTable.isCover, true)
        )
      );

    const coverMap = new Map(coverImages.map((img) => [img.productId, img.imgUrl]));

    const productsWithCovers = products.map((p) => ({
      ...p,
      coverImage: coverMap.get(p.id) || null,
    }));

    return productsWithCovers;
  } catch (error) {
    console.error('標籤商品查詢錯誤:', error);
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

// 智能搜尋邏輯
// 智能標籤搜尋功能
const searchByTagType = async (keyword, tagType) => {
  try {
    // 搜尋特定類型的標籤
    const matchingTags = await db
      .select()
      .from(tagsTable)
      .where(and(ilike(tagsTable.tagname, `%${keyword}%`), eq(tagsTable.type, tagType)));

    if (matchingTags.length === 0) return [];

    const tagIds = matchingTags.map((tag) => tag.id);
    const productTagRelations = await db
      .select()
      .from(productTagSTable)
      .where(inArray(productTagSTable.tagId, tagIds));

    if (productTagRelations.length === 0) return [];

    const productIds = productTagRelations.map((pt) => pt.productId);
    const products = await db
      .select()
      .from(productsTable)
      .where(
        and(
          eq(productsTable.isDeleted, false),
          eq(productsTable.status, 'active'),
          inArray(productsTable.id, productIds)
        )
      )
      .limit(10);

    // 添加封面圖片
    if (products.length > 0) {
      const activeProductIds = products.map((p) => p.id);
      const coverImages = await db
        .select({ productId: productImagesTable.productId, imgUrl: productImagesTable.imgUrl })
        .from(productImagesTable)
        .where(
          and(
            inArray(productImagesTable.productId, activeProductIds),
            eq(productImagesTable.isCover, true)
          )
        );

      const coverMap = new Map(coverImages.map((img) => [img.productId, img.imgUrl]));
      return products.map((p) => ({ ...p, coverImage: coverMap.get(p.id) || null }));
    }

    return products;
  } catch (error) {
    console.error(`搜尋${tagType}標籤時發生錯誤:`, error);
    return [];
  }
};

// 增強模糊搜尋功能（除了魔物獵人需要完整匹配）
const fuzzySearchProducts = async (keywords) => {
  try {
    let allResults = new Map();

    for (const keyword of keywords) {
      if (keyword.includes('魔物獵人') || keyword.toLowerCase().includes('monster hunter')) {
        const results = await db
          .select()
          .from(productsTable)
          .where(
            and(
              eq(productsTable.isDeleted, false),
              eq(productsTable.status, 'active'),
              or(
                ilike(productsTable.name, '%魔物獵人%'),
                ilike(productsTable.name, '%Monster Hunter%'),
                ilike(productsTable.name, '%MonsterHunter%')
              )
            )
          )
          .limit(15);
        results.forEach((product) => {
          allResults.set(product.id, product);
        });
      } else {
        let searchQueries = [];
        searchQueries.push(
          db
            .select()
            .from(productsTable)
            .where(
              and(
                eq(productsTable.isDeleted, false),
                eq(productsTable.status, 'active'),
                ilike(productsTable.name, `%${keyword}%`)
              )
            )
            .limit(15)
        );
        if (keyword.length >= 2) {
          searchQueries.push(
            db
              .select()
              .from(productsTable)
              .where(
                and(
                  eq(productsTable.isDeleted, false),
                  eq(productsTable.status, 'active'),
                  ilike(productsTable.name, `${keyword}%`)
                )
              )
              .limit(10)
          );
          searchQueries.push(
            db
              .select()
              .from(productsTable)
              .where(
                and(
                  eq(productsTable.isDeleted, false),
                  eq(productsTable.status, 'active'),
                  ilike(productsTable.sku, `%${keyword}%`)
                )
              )
              .limit(5)
          );
        }
        if (keyword.length >= 3) {
          searchQueries.push(
            db
              .select()
              .from(productsTable)
              .where(
                and(
                  eq(productsTable.isDeleted, false),
                  eq(productsTable.status, 'active'),
                  ilike(productsTable.description, `%${keyword}%`)
                )
              )
              .limit(8)
          );
        }
        for (const query of searchQueries) {
          try {
            const results = await query;
            results.forEach((product) => {
              allResults.set(product.id, product);
            });
          } catch (queryError) {}
        }
      }
    }

    const products = Array.from(allResults.values());

    if (products.length > 0) {
      const productIds = products.map((p) => p.id);
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
      const productsWithCovers = products.map((p) => ({
        ...p,
        coverImage: coverMap.get(p.id) || null,
      }));

      console.log('模糊搜尋完成，已添加封面圖片');
      return productsWithCovers;
    }

    return products;
  } catch (error) {
    console.error('模糊搜尋商品時發生錯誤:', error);
    return [];
  }
};

// 系列商品隨機推薦功能
const searchSeriesProducts = async (seriesKeyword, requestedQuantity = 3) => {
  try {
    const seriesMapping = {
      組裝模型: ['組裝模型'],
      PVC: ['PVC'],
      可動完成品: ['可動完成品'],
      景品: ['景品'],
      手機架: ['手機架'],
      黏土人: ['黏土人'],
      GK: ['GK'],
      拼圖模型: ['拼圖模型'],
      盒玩: ['盒玩'],
      掛軸: ['掛軸'],
      IC卡: ['IC卡'],
      靜態完成品: ['靜態完成品'],
      模型: ['組裝模型', '拼圖模型'],
      完成品: ['可動完成品', '靜態完成品'],
      Nendoroid: ['黏土人'],
      nendoroid: ['黏土人'],
    };

    let tagNames = seriesMapping[seriesKeyword] || [seriesKeyword];

    if (tagNames.length === 0) {
      return [];
    }

    const matchingTags = await db
      .select()
      .from(tagsTable)
      .where(
        and(
          eq(tagsTable.type, 'series'),
          or(...tagNames.map((name) => eq(tagsTable.tagname, name)))
        )
      );

    if (matchingTags.length === 0) {
      return [];
    }

    const tagIds = matchingTags.map((tag) => tag.id);
    const productTagRelations = await db
      .select()
      .from(productTagSTable)
      .where(inArray(productTagSTable.tagId, tagIds));

    if (productTagRelations.length === 0) {
      return [];
    }

    const productIds = productTagRelations.map((pt) => pt.productId);
    const allProducts = await db
      .select()
      .from(productsTable)
      .where(
        and(
          eq(productsTable.isDeleted, false),
          eq(productsTable.status, 'active'),
          inArray(productsTable.id, productIds)
        )
      );

    if (allProducts.length === 0) return [];
    const shuffled = allProducts.sort(() => 0.5 - Math.random());
    const selectedProducts = shuffled.slice(0, Math.min(requestedQuantity, allProducts.length));
    const productIds_final = selectedProducts.map((p) => p.id);
    const coverImages = await db
      .select({ productId: productImagesTable.productId, imgUrl: productImagesTable.imgUrl })
      .from(productImagesTable)
      .where(
        and(
          inArray(productImagesTable.productId, productIds_final),
          eq(productImagesTable.isCover, true)
        )
      );

    const coverMap = new Map(coverImages.map((img) => [img.productId, img.imgUrl]));
    const productsWithCovers = selectedProducts.map((p) => ({
      ...p,
      coverImage: coverMap.get(p.id) || null,
    }));

    return productsWithCovers;
  } catch (error) {
    return [];
  }
};

const smartSearch = async (message, requestedQuantity = 3) => {
  const keywords = extractProductKeywords(message);

  let products = [];
  let searchResult = { products: [], searchType: 'none', searchKeyword: null };

  if (keywords.length === 0) {
    const allProducts = await getProducts();
    if (allProducts.length > 0) {
      const shuffled = allProducts.sort(() => 0.5 - Math.random());
      products = shuffled.slice(0, Math.min(5, allProducts.length));
      searchResult = { products, searchType: 'random', searchKeyword: null };
    }
    return searchResult;
  }

  const searchKeyword = keywords[0]; // 使用第一個關鍵詞

  // 0. 優先檢查是否為系列查詢
  const seriesKeywords = [
    '組裝模型',
    'PVC',
    '可動完成品',
    '景品',
    '手機架',
    '黏土人',
    'GK',
    '拼圖模型',
    '盒玩',
    '掛軸',
    'IC卡',
    '靜態完成品',
    '模型',
    '完成品',
    'Nendoroid',
    'nendoroid',
  ];

  for (const keyword of keywords) {
    if (seriesKeywords.includes(keyword)) {
      products = await searchSeriesProducts(keyword, requestedQuantity);
      if (products.length > 0) {
        searchResult = {
          products,
          searchType: 'series',
          searchKeyword: keyword,
          searchTypeDisplay: '系列',
          isSeriesRecommendation: true,
        };
        return searchResult;
      }
    }
  }

  products = await searchProductsByName(searchKeyword);
  if (products.length > 0) {
    const productIds = products.map((p) => p.id);
    const coverImages = await db
      .select({ productId: productImagesTable.productId, imgUrl: productImagesTable.imgUrl })
      .from(productImagesTable)
      .where(
        and(inArray(productImagesTable.productId, productIds), eq(productImagesTable.isCover, true))
      );

    const coverMap = new Map(coverImages.map((img) => [img.productId, img.imgUrl]));
    products = products.map((p) => ({ ...p, coverImage: coverMap.get(p.id) || null }));

    searchResult = { products, searchType: 'name', searchKeyword };
    return searchResult;
  }
  products = await fuzzySearchProducts(keywords);
  if (products.length > 0) {
    searchResult = { products, searchType: 'fuzzy', searchKeyword: keywords.join('、') };
    return searchResult;
  }
  const tagTypes = ['ip', 'brand', 'series'];

  for (const tagType of tagTypes) {
    for (const keyword of keywords) {
      products = await searchByTagType(keyword, tagType);
      if (products.length > 0) {
        const typeMap = { ip: 'IP系列', brand: '品牌', series: '系列' };
        searchResult = {
          products,
          searchType: tagType,
          searchKeyword: keyword,
          searchTypeDisplay: typeMap[tagType],
        };
        return searchResult;
      }
    }
  }

  // 4. 如果沒找到，嘗試用原本的模糊搜尋
  products = await getProducts(searchKeyword);
  if (products.length > 0) {
    searchResult = { products, searchType: 'name', searchKeyword };
    return searchResult;
  }

  // 5. 最後返回隨機推薦（確保一定有商品推薦）
  const allProducts = await getProducts();
  if (allProducts.length > 0) {
    const shuffled = allProducts.sort(() => 0.5 - Math.random());
    products = shuffled.slice(0, Math.min(requestedQuantity, allProducts.length));

    // 添加封面圖片
    const productIds = products.map((p) => p.id);
    const coverImages = await db
      .select({ productId: productImagesTable.productId, imgUrl: productImagesTable.imgUrl })
      .from(productImagesTable)
      .where(
        and(inArray(productImagesTable.productId, productIds), eq(productImagesTable.isCover, true))
      );

    const coverMap = new Map(coverImages.map((img) => [img.productId, img.imgUrl]));
    products = products.map((p) => ({ ...p, coverImage: coverMap.get(p.id) || null }));

    searchResult = { products, searchType: 'random', searchKeyword, requestedQuantity };
  }

  return searchResult;
};

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
      /商品|產品|推薦|購買|價格|有什麼|想要|需要|找|搜尋|公仔|手辦|模型|玩具|鋼彈|變形金剛|河馬|無職轉生|遊戲王|數碼寶貝|初音未來|假面騎士|哥吉拉|精靈寶可夢|overlord|魔物獵人|葬送|芙莉蓮|烙印勇士|孤獨搖滾|狼與辛香料|蔚藍檔案|超人力霸王|犬夜叉|莉可麗絲|魔神|女神異聞錄|史努比|崩壞|星穹鐵道|熊熊遇見你|瑞克和莫蒂|探險活寶|hololive|夢想成為魔法少女|環太平洋|絕區零|物語系列|妮姬|我的英雄學院|厲陰宅|牠|組裝模型|PVC|可動完成品|景品|手機架|黏土人|GK|拼圖模型|盒玩|掛軸|IC卡|靜態完成品|完成品|Nendoroid/.test(
        message
      );

    // 特殊處理：當用戶問一般性商品問題時，觸發隨機推薦
    const isGeneralProductQuery =
      /有什麼商品|什麼商品|推薦商品|有哪些|推薦什麼|有什麼可以|商品推薦/.test(message);

    const requestedQuantity = extractRequestedQuantity(message);

    let productInfo = '';

    if (isGeneralProductQuery) {
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
      const conversationContext = recentMessages
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join('\n');

      // 從歷史中提取商品關鍵詞
      const historyText = recentMessages.map((msg) => msg.content).join(' ');
      const contextKeywords = extractProductKeywords(historyText);

      if (contextKeywords.length > 0) {
        contextInfo = `\n\n對話上下文：用戶之前提到了 ${contextKeywords.join('、')} 相關內容`;
      }
    }

    if (isProductQuery) {
      const searchResult = await smartSearch(message, requestedQuantity);
      productInfo = await generateRecommendation(searchResult);
    }

    let searchInfo = '';
    let hasFoundProducts = false;

    if ((isProductQuery || isGeneralProductQuery) && productInfo) {
      if (
        productInfo.includes('🎯 找到與') ||
        productInfo.includes('🎯 找到 IP系列') ||
        productInfo.includes('🏭 找到 品牌') ||
        productInfo.includes('📺 找到 系列')
      ) {
        hasFoundProducts = true;
        searchInfo = '\n\n【重要】：系統成功找到了相關商品，請簡單確認找到商品即可，不要說推薦。';
      } else if (
        productInfo.includes('🎯 為您推薦我們店內的熱門商品') ||
        productInfo.includes('🎯 為您推薦熱門商品')
      ) {
        hasFoundProducts = true;
        searchInfo = '\n\n【重要】：系統提供了熱門商品推薦，請表達為客戶推薦商品，不要說沒有找到。';
      } else {
        hasFoundProducts = true;
        searchInfo = '\n\n【重要】：系統提供了其他推薦商品，請表達為客戶推薦其他商品。';
      }
    }

    const prompt = `你是玩派玩具店的專業客服，專門幫助客戶找到他們想要的模型玩具。

【標籤系統理解】：
我們的商品按照三種標籤分類：
1. IP系列（智慧財產權）：如鋼彈、變形金剛、無職轉生、遊戲王、河馬、數碼寶貝、初音未來、假面騎士、哥吉拉、精靈寶可夢等角色作品
2. 品牌（brand）：如BANDAI、TAITO、Good Smile、MegaHouse、Kotobukiya、TAKARATOMY等製造商
3. 系列（series）：如組裝模型、PVC、可動完成品、景品、黏土人、GK等產品線

【系列查詢處理】：
當客戶詢問「組裝模型」「PVC」「景品」「黏土人」「可動完成品」等系列時，系統會自動推薦該系列的精選商品。

【絕對禁止事項】：
1. 嚴禁使用任何簡體字
2. 絕對不要編造任何商品資訊、系列名稱、公司名稱
3. 禁止提及我們沒有的商品系列（如：航海王、火影忍者、七龍珠、海賊王、死神、MG、RG、PG、HG等級別分類）
4. 禁止描述具體的商品功能、特色或規格
5. 禁止舉例說明不存在的商品型號或系列
6. 不要問使用者偏好什麼系列或機體，因為我們可能沒有
7. 絕對不要在回應中出現「[連結1]」「[連結2]」等技術性佔位符
8. 不要在AI回應中重複顯示商品推薦，因為系統會自動添加商品清單
9. 【重要】絕對禁止提及任何具體的動漫作品名稱，只能說「相關商品」或「熱門商品」

【必須遵守】：
1. AI回應要簡潔自然，不要提及商品清單或連結
2. 系統會自動在AI回應後添加相關商品推薦
3. 根據搜尋結果回應：
   - 如果系統找到商品：表達找到了相關商品，不要說沒有
   - 如果系統沒找到：才說沒有找到，並建議其他選擇
4. 使用繁體中文回應
5. 不要在回應中重複說明商品內容，因為下方會有詳細商品資訊

【回應格式】：
${
  hasFoundProducts
    ? productInfo &&
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

    const formattedText = aiResponse.replace(/\n/g, '<br>');
    const finalResponse = formattedText + (productInfo ? productInfo.replace(/\n/g, '<br>') : '');

    res.json({ reply: finalResponse });
  } catch (error) {
    res.status(500).json({ error: '抱歉，我現在無法處理您的請求。請稍後再試。' });
  }
};
