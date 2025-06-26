/**
 * 文字處理相關服務
 */

const extractProductKeywords = (message) => {
  let keywords = [];

  // 關鍵詞映射表 - 基於實際資料庫中的商品和標籤
  const keywordMapping = {
    // === 系列類型 (SERIES) ===
    組裝模型: ['組裝模型', '模型', '拼裝', '拼組'],
    PVC: ['PVC', 'pvc', '完成品', '公仔'],
    可動完成品: ['可動', '可動完成品', '可動模型', 'figma', 'Figma'],
    景品: ['景品', '一番賞', '盒玩', 'COREFUL', 'TENITOL'],
    黏土人: ['黏土人', 'nendoroid', 'Nendoroid', '點黏土'],
    GK: ['GK', 'gk', '樹脂', '限定', 'Resin'],
    拼圖模型: ['拼圖模型', '金屬拼圖', '金屬Nano'],
    手機架: ['手機架', 'DESKTOP MONSTER'],
    掛軸: ['掛軸', '藝術掛軸'],
    IC卡: ['IC卡', '一卡通', '卡片'],
    靜態完成品: ['靜態完成品', '靜態'],
    盒玩: ['盒玩', '食玩', '小盒玩'],

    // === IP 作品 ===
    變形金剛: ['變形金剛', 'Transformer', 'TRANSFORMERS', 'SYNERGENEX'],
    '無職轉生～到了異世界就拿出真本事～': ['無職轉生', 'Melty Princess', '洛琪希', '希露菲葉特'],
    遊戲王: ['遊戲王', 'Yu-Gi-Oh', '混沌士兵'],
    百獸王GOLION: ['百獸王GOLION', '百獸王', 'GOLION', '五獅合體', '聖戰士'],
    河馬: ['河馬', '侏儒河馬', '巨大侏儒河馬'],
    閃電霹靂車: ['閃電霹靂車', '阿斯拉', 'EX史培利昂'],
    數碼寶貝: ['數碼寶貝', 'Digimon', '機械暴龍獸'],
    藍寶堅尼Aventador: ['藍寶堅尼Aventador', 'Lamborghini Aventador', 'Aventador'],
    'R35 GT-R': ['R35 GT-R', 'GT-R', 'GTR', 'Skyline'],
    KENMARY: ['KENMARY WORKS', 'KENMARY'],
    藍寶堅尼Huracan: ['藍寶堅尼Huracan', 'Lamborghini Huracan', 'Huracan'],
    'VERTEX JZS161 Aristo': ['VERTEX', 'JZS161', 'Aristo'],
    RE雨宮: ['RE雨宮', 'FD3SRX-7'],
    'Secret BNR34 Skyline GT-R': ['Top Secret', 'BNR34', 'Secret'],
    'Greddy&Rocket Bunny Enkei': ['Greddy', 'Rocket Bunny', 'Enkei', 'ZN6 86'],
    福斯金龜車: ['福斯金龜車', '金龜車', 'Volkswagen', '福斯'],
    孤獨搖滾: ['孤獨搖滾', '孤獨搖滾！', '後藤一里', '廣井菊理'],
    魔物獵人: ['魔物獵人', 'Monster Hunter', 'MonsterHunter', '荒野', '雄火龍大劍'],
    狼與辛香料: ['狼與辛香料', '赫蘿', '兔女郎'],
    Overlord: ['Overlord', 'overlord', '雅兒貝德', '旗袍'],
    魔女之旅: ['魔女之旅', '伊蕾娜', '甜蜜惡魔', '襯衫'],
    不時輕聲地以俄語遮羞的鄰座艾莉同學: [
      '不時輕聲地以俄語遮羞的鄰座艾莉同學',
      '艾莉同學',
      '艾莉',
      '制服',
    ],
    初音未來: ['初音未來', 'Miku', 'Hatsune Miku', '生日', '十面埋伏'],
    假面騎士: ['假面騎士', 'Kamen Rider', 'Build', '齊魯巴蜘蛛', '肌肉銀河滿瓶'],
    約會大作戰: ['約會大作戰', 'Date A Live', '時崎狂三', '四糸乃', '貓耳女僕'],
    PANDEM: ['PANDEM', 'Yaris Mooneyes'],
    蔚藍檔案: ['蔚藍檔案', 'Blue Archive', '佳世子', '正月'],
    超人力霸王: ['超人力霸王', 'Ultraman', '迪卡', '複合型態'],
    犬夜叉: ['犬夜叉', 'Inuyasha', '殺生丸'],
    '3式機龍': ['3式機龍', '機龍', '重武装型', '高機動型'],
    車庫拍攝: ['車庫拍攝', '三人套組'],
    莉可麗絲: ['莉可麗絲', '井之上瀧奈', '錦木千束', '白洋裝'],
    哥吉拉: [
      '哥吉拉',
      'Godzilla',
      '機械王者基多拉',
      '王者基多拉',
      '碧奧蘭蒂',
      '正宗哥吉拉',
      '熱線放射',
    ],
    魔神Z: ['魔神Z', 'Grendizer U', '金剛戰神U'],
    女神異聞錄: ['女神異聞錄', 'Persona', 'P3R', '主角'],
    精靈寶可夢: [
      '精靈寶可夢',
      'Pokemon',
      '寶可夢',
      'NEON PARTY',
      'Little Night',
      '草苗龜',
      '波加曼',
      '波皇子',
    ],
    史努比: ['史努比', 'Snoopy', '藝術裝飾框', '美式甜點店'],
    超力戰隊王連者: ['超力戰隊王連者', 'POWER BRACE', '三十週年'],
    '崩壞:星穹鐵道': [
      '崩壞:星穹鐵道',
      '星穹鐵道',
      'Honkai Star Rail',
      '景元',
      '彦卿',
      '桑博',
      '花火',
      '無名客的獎章',
    ],
    熊熊遇見你: ['熊熊遇見你', 'We Bare Bears', '自拍', '派對', '甜甜圈', '飄飄玩', '逗趣', '歡樂'],
    瑞克和莫蒂: ['瑞克和莫蒂', 'Rick and Morty', 'science', 'risk', '酸黃瓜瑞克'],
    探險活寶: ['探險活寶', 'Adventure Time', '阿寶', '老皮', '嗶莫', '檸檬公爵'],
    IRENA: ['IRENA', 'GUWEIZ'],
    '魅魔 風紀委員': ['魅魔', '風紀委員', '澪奈'],
    月刊少女野崎同學: ['月刊少女野崎同學', '野崎同學', '佐倉千代', '御子柴實琴'],
    hololive: ['hololive', 'Mococo', 'Fuwawa', '阿比斯加德', 'AXGRIT'],
    夢想成為魔法少女: ['夢想成為魔法少女', '瑪吉雅硫磺'],
    鋼彈: ['鋼彈', 'Gundam', 'CONVERGE CORE', 'GQuuuuuuX', '紅色鋼彈'],
    納蘭詞: ['納蘭詞', 'Biya'],
    環太平洋: ['環太平洋', '吉普賽危機', '重機形'],
    虎甲人: ['虎甲人'],
    倒牛奶的女僕: ['倒牛奶的女僕', '維梅爾'],
    絕區零: ['絕區零', '馮·萊卡恩'],
    物語系列: ['物語系列', '忍野忍', 'TRICK OR TREAT'],
    '勝利女神：妮姬': ['勝利女神：妮姬', '勝利女神', '妮姬', 'NIKKE', '阿妮斯', '拉毗'],
    我的英雄學院: ['我的英雄學院', '奮進人'],
    厲陰宅: ['厲陰宅', '安娜貝爾', 'Annabelle'],
    牠: ['牠', '潘尼懷斯', 'Pennywise'],
    葬送的芙莉蓮: ['葬送的芙莉蓮', '芙莉蓮'],
    '藍寶堅尼 Lamborghini Huracán': [
      '藍寶堅尼 Huracán',
      'Lamborghini Huracán',
      'GT3 EVO2',
      'Forte Racing',
    ],
    '福斯 Volkswagen': ['福斯 Volkswagen', 'ID.Buzz', 'Candy White', 'Energetic Orange'],
    '日產 Nissan LB-ER34': ['日產 Nissan LB-ER34', 'LB-ER34', 'Super Silhouette'],
    '布加迪 Bugatti W16': ['布加迪 Bugatti W16', 'W16 Mistral'],
    '馬自達 Mazda RX-7': ['馬自達 Mazda RX-7', 'RX-7', 'VeilSide Fortune'],
    '本田 Honda VEZEL': [
      '本田 Honda VEZEL',
      'VEZEL',
      'HR-V',
      '午夜金屬藍',
      '珍珠黑',
      '金屬灰',
      '白金珍珠白',
      '日光珍珠白',
    ],
    烙印勇士: ['烙印勇士', '骷髏騎士'],

    // === 品牌 (BRAND) ===
    TAKARATOMY: ['TAKARATOMY', 'TOMY', 'T-SPARK'],
    MegaHouse: ['MegaHouse', 'MEGAHOUSE', 'Melty Princess'],
    KAIYODO: ['KAIYODO', '海洋堂', 'REVOLTECH'],
    'Good Smile': ['Good Smile', 'GSC', 'Good Smile Company', 'MODEROID', 'POP UP PARADE', 'figma'],
    JXK: ['JXK'],
    BANDAI: ['BANDAI', '萬代', 'X-PLUS', 'DefoReal', 'FW'],
    'AOSHIMA 青島': ['AOSHIMA', '青島', 'AOSHIMA 青島', '樂Pla Snap Kit'],
    PROOF: ['PROOF'],
    'SK JAPAN': ['SK JAPAN'],
    TAITO: ['TAITO', 'Coreful Figure', 'AMP+ Figure'],
    '豐田 Toyota': ['豐田', 'Toyota'],
    FURYU: ['FURYU', 'F:NEX', 'TENITOL TALL'],
    Threezero: ['Threezero', 'FigZero'],
    TOHO: ['TOHO', '東寶', 'DESKTOP MONSTER'],
    'WT Minifactory': ['WT Minifactory'],
    BellFine: ['BellFine', 'bellfine', 'Bell Fine'],
    一番賞: ['一番賞'],
    PLEX: ['PLEX', '金屬Nano'],
    Kotobukiya: ['Kotobukiya', '壽屋', '極獸造型'],
    'Re-ment': ['Re-ment'],
    RIBOSE: ['RIBOSE', '核糖文化'],
    CAPCOM: ['CAPCOM'],
    一卡通: ['一卡通'],
    HIROKAWA: ['HIROKAWA', 'G.A.F.C.系列'],
    Animester: ['Animester', '大漫匠'],
    Design: ['Design', 'COCO'],
    BANPRESTO: ['BANPRESTO', 'THE AMAZING HEROES PLUS'],
    野獸國: ['野獸國', 'Beast Kingdom'],
    MINIGT: ['MINIGT'],
    'Hobby JAPAN': ['Hobby JAPAN'],
    QuesQ: ['QuesQ'],
    'Max Factory': ['Max Factory'],
    BearPanda: ['BearPanda'],
    'Infinity Studio': ['Infinity Studio', '重機形'],
    KADOKAWA: ['KADOKAWA', 'KDcolle'],
  };

  // 搜尋邏輯：優先匹配更具體的關鍵詞
  const allMappings = Object.entries(keywordMapping);

  // 按關鍵詞長度排序，優先匹配較長的關鍵詞
  const sortedMappings = allMappings.sort((a, b) => {
    const maxLenA = Math.max(...a[1].map((k) => k.length));
    const maxLenB = Math.max(...b[1].map((k) => k.length));
    return maxLenB - maxLenA;
  });

  for (const [mainKeyword, variants] of sortedMappings) {
    for (const variant of variants) {
      if (message.includes(variant)) {
        keywords.push(mainKeyword);
        return keywords; // 找到一個匹配就返回
      }
    }
  }

  return keywords;
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

const cleanProductDescription = (description) => {
  if (!description) return '';

  let cleaned = description;

  // 移除HTML標籤
  cleaned = cleaned.replace(/<[^>]*>/g, ' ');

  // 移除常見的商品聲明和注意事項
  const removePatterns = [
    /※[^※]*※/g,
    /＊[^＊]*＊/g,
    /注意[：:][^。！？\n]*/g,
    /提醒[：:][^。！？\n]*/g,
    /請注意[^。！？\n]*/g,
    /商品廠牌[：:].*?(?=\s|$)/g,
    /商品類型[：:].*?(?=\s|$)/g,
    /下單注意事項[：:].*?(?=\s|$)/g,
    /※.*?實際商品.*?※/g,
    /※.*?組裝模型.*?※/g,
    /※.*?成形色.*?※/g,
    /※.*?自行組裝.*?※/g,
    /※.*?上色.*?※/g,
    /※.*?照片.*?異.*?※/g,
    /本商品為.*?需.*?(?=\s|$)/g,
    /圖片為.*?實際.*?(?=\s|$)/g,
    /實際商品.*?照片.*?(?=\s|$)/g,
    /需自行.*?(?=\s|$)/g,
    /請.*?購買.*?(?=\s|$)/g,
    /\(.*?組裝.*?\)/g,
    /\(.*?塗裝.*?\)/g,
    /【.*?】/g,
    /\[.*?\]/g,
  ];

  // 依序移除不需要的模式
  removePatterns.forEach((pattern) => {
    cleaned = cleaned.replace(pattern, '');
  });

  // 清理多餘的空白字符
  cleaned = cleaned
    .replace(/\s+/g, ' ')
    .replace(/[,，]\s*[,，]/g, '，')
    .replace(/[。！？]\s*[。！？]/g, '。')
    .trim();

  // 如果清理後的文字太短，返回空字串
  if (cleaned.length < 10) {
    return '';
  }

  // 限制長度並確保完整句子
  if (cleaned.length > 60) {
    // 找到第60字符附近的句號、逗號或空格
    const truncatePoint = cleaned.substring(0, 60);
    const lastPunctuation = Math.max(
      truncatePoint.lastIndexOf('。'),
      truncatePoint.lastIndexOf('，'),
      truncatePoint.lastIndexOf(' ')
    );

    if (lastPunctuation > 30) {
      cleaned = cleaned.substring(0, lastPunctuation);
    } else {
      cleaned = cleaned.substring(0, 60);
    }
  }

  return cleaned;
};

const checkForProductRecommendationQuery = (message) => {
  const recommendationPatterns = [
    /推薦/,
    /介紹/,
    /有什麼/,
    /什麼.*好/,
    /給我.*個/,
    /想要/,
    /想買/,
    /找.*的/,
    /有沒有/,
    /建議/,
    /適合/,
    /推薦.*玩具/,
    /推薦.*商品/,
    /推薦.*模型/,
    /玩具.*推薦/,
    /商品.*推薦/,
    /模型.*推薦/,
    /什麼.*玩具/,
    /什麼.*模型/,
    /什麼.*商品/,
  ];

  return recommendationPatterns.some((pattern) => pattern.test(message));
};

const checkForDirectRecommendationQuery = (message) => {
  return /直接推薦|隨便推薦|推薦幾個|給我推薦/.test(message);
};

const checkForMoreProductsQuery = (message) => {
  const moreProductsPatterns = [
    /還有別的嗎/,
    /還有嗎/,
    /還有其他的嗎/,
    /還有什麼/,
    /還有沒有/,
    /別的.*嗎/,
    /其他.*嗎/,
    /更多.*嗎/,
    /換一些/,
    /看看其他/,
    /其他商品/,
    /別的商品/,
    /更多商品/,
    /還有什麼商品/,
    /那還有別的嗎/,
    /那還有嗎/,
    /那還有什麼/,
  ];

  return moreProductsPatterns.some((pattern) => pattern.test(message));
};

module.exports = {
  extractProductKeywords,
  extractRequestedQuantity,
  cleanProductDescription,
  checkForProductRecommendationQuery,
  checkForDirectRecommendationQuery,
  checkForMoreProductsQuery,
};
