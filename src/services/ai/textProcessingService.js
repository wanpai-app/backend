/**
 * 文字處理相關服務
 */

const extractProductKeywords = (message) => {
  let keywords = [];

  // 系列相關關鍵詞（最高優先序）
  const seriesKeywords = [
    '組裝模型',
    'PVC',
    '可動完成品',
    '景品',
    '黏土人',
    'GK',
    '鋼彈',
    '高達',
    'GUNDAM',
    'gundam',
    'Gundam',
    '變形金剛',
    'Transformer',
    '無職轉生',
    '遊戲王',
    'Yu-Gi-Oh',
    '百獸王',
    'GOLION',
    '百獸王GOLION',
    '河馬',
    'hippo',
    '閃電霹靂車',
    '數碼寶貝',
    'Digimon',
    '藍寶堅尼',
    'Lamborghini',
    '孤獨搖滾',
    '狼與辛香料',
    '魔物獵人',
    'Monster Hunter',
    'MonsterHunter',
    'Overlord',
    'overlord',
    '魔女之旅',
    '不時輕聲地以俄語遮羞的鄰座艾莉同學',
    '初音未來',
    'Hatsune Miku',
    'Miku',
    '假面騎士',
    'Kamen Rider',
    '約會大作戰',
    'Date A Live',
    '蔚藍檔案',
    'Blue Archive',
    '超人力霸王',
    'Ultraman',
    '犬夜叉',
    'Inuyasha',
    '莉可麗絲',
    'LycoReco',
    '哥吉拉',
    'Godzilla',
    '月刊少女野崎同學',
    '野崎同學',
    'hololive',
    '探險活寶',
    'Adventure Time',
    '瑞克和莫蒂',
    'Rick and Morty',
    '熊熊遇見你',
    'We Bare Bears',
    '崩壞:星穹鐵道',
    '星穹鐵道',
    'Honkai Star Rail',
    '史努比',
    'Snoopy',
    '精靈寶可夢',
    'Pokemon',
    '寶可夢',
    '皮卡丘',
    '我的英雄學院',
    '綠谷出久',
    '爆豪勝己',
  ];

  // 檢查系列關鍵詞
  for (const keyword of seriesKeywords) {
    if (message.includes(keyword)) {
      keywords.push(keyword);
      break; // 找到一個系列關鍵詞就足夠了
    }
  }

  // 如果沒有找到系列關鍵詞，繼續其他搜尋邏輯
  if (keywords.length === 0) {
    // IP相關關鍵詞（只包含實際存在的商品）
    const ipKeywords = [
      '狼與辛香料',
      '蔚藍檔案',
      'Blue Archive',
      '超人力霸王',
      'Ultraman',
      '莉可麗絲',
      'LycoReco',
      '哥吉拉',
      'Godzilla',
      'Overlord',
      'overlord',
      '魔女之旅',
      '犬夜叉',
      'Inuyasha',
      '月刊少女野崎同學',
      '野崎同學',
      'hololive',
      '不時輕聲地以俄語遮羞的鄰座艾莉同學',
      '艾莉同學',
      '百獸王',
      'GOLION',
      '無職轉生',
      '河馬',
      'hippo',
      '閃電霹靂車',
      '數碼寶貝',
      'Digimon',
      '藍寶堅尼',
      'Lamborghini',
      '遊戲王',
      'Yu-Gi-Oh',
      '魔物獵人',
      'Monster Hunter',
      'MonsterHunter',
      '初音未來',
      'Hatsune Miku',
      'Miku',
      '假面騎士',
      'Kamen Rider',
      '約會大作戰',
      'Date A Live',
      '孤獨搖滾',
      '探險活寶',
      'Adventure Time',
      '瑞克和莫蒂',
      'Rick and Morty',
      '熊熊遇見你',
      'We Bare Bears',
      '崩壞:星穹鐵道',
      '星穹鐵道',
      'Honkai Star Rail',
      '史努比',
      'Snoopy',
      '精靈寶可夢',
      'Pokemon',
      '寶可夢',
      '皮卡丘',
      '我的英雄學院',
    ];

    // 品牌關鍵詞
    const brandKeywords = [
      'GSC',
      'Good Smile Company',
      'Kotobukiya',
      '壽屋',
      'Bandai',
      '萬代',
      'Figma',
      'Nendoroid',
      'Hot Toys',
      'Prime 1 Studio',
      'Sideshow',
      'Threezero',
      'Medicom',
      'Square Enix',
      'TAITO',
      'BellFine',
      'Furyu',
      'PROOF',
      'Max Factory',
      'QuesQ',
      'MEGAHOUSE',
      'AOSHIMA',
      '青島',
      'KAIYODO',
      '海洋堂',
    ];

    // 依序檢查不同類型的關鍵詞
    const allKeywordSets = [
      { keywords: ipKeywords, type: 'ip' },
      { keywords: brandKeywords, type: 'brand' },
    ];

    for (const keywordSet of allKeywordSets) {
      for (const keyword of keywordSet.keywords) {
        if (message.includes(keyword)) {
          keywords.push(keyword);
          if (keywords.length >= 3) break;
        }
      }
      if (keywords.length > 0) break;
    }

    // 模糊匹配（字元相似度）- 只包含實際存在的商品
    if (keywords.length === 0) {
      // 使用正規表達式進行更靈活的匹配
      const patterns = [
        /狼與辛香料/,
        /蔚藍檔案|blue.?archive/i,
        /超人力霸王|ultraman/i,
        /莉可麗絲|lycorico/i,
        /哥吉拉|godzilla/i,
        /overlord/i,
        /魔女之旅/,
        /犬夜叉|inuyasha/i,
        /野崎同學/,
        /hololive/i,
        /無職轉生/,
        /河馬|hippo/i,
        /閃電霹靂車/,
        /數碼寶貝|digimon/i,
        /藍寶堅尼|lamborghini/i,
        /遊戲王|yu.?gi.?oh/i,
        /魔物獵人|monster.?hunter/i,
        /初音未來|hatsune.?miku|miku/i,
        /假面騎士|kamen.?rider/i,
        /約會大作戰|date.?a.?live/i,
        /孤獨搖滾/,
        /探險活寶|adventure.?time/i,
        /瑞克和莫蒂|rick.?and.?morty/i,
        /熊熊遇見你|we.?bare.?bears/i,
        /崩壞.*星穹鐵道|honkai.?star.?rail/i,
        /史努比|snoopy/i,
        /精靈寶可夢|pokemon|寶可夢|皮卡丘/i,
        /我的英雄學院/i,
      ];

      for (const pattern of patterns) {
        const match = message.match(pattern);
        if (match) {
          keywords.push(match[0]);
          break;
        }
      }

      // 單字元關鍵詞檢查（只針對確實存在的商品）
      if (keywords.length === 0) {
        const singleCharKeywords = [
          '狼',
          '蔚',
          '超',
          '莉',
          '哥',
          '魔',
          '犬',
          '野',
          '無',
          '河',
          '閃',
          '數',
          '藍',
          '遊',
          '初',
          '假',
          '約',
          '孤',
          '探',
          '瑞',
          '熊',
          '崩',
          '史',
          '精',
          '英',
        ];
        const foundSingleChar = singleCharKeywords.filter((char) => message.includes(char));

        if (foundSingleChar.length > 0) {
          const words = message
            .split('')
            .filter(
              (char) =>
                ![
                  '我',
                  '想',
                  '要',
                  '買',
                  '找',
                  '搜',
                  '有',
                  '沒',
                  '推',
                  '薦',
                  '的',
                  '個',
                  '一',
                  '這',
                  '那',
                  '什',
                  '麼',
                  '哪',
                  '裡',
                  '嗎',
                  '呢',
                  '啊',
                  '喔',
                  '哦',
                ].includes(char)
            );
          if (words.length > 0) {
            keywords.push(foundSingleChar[0]);
          }
        }
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
  ];

  return recommendationPatterns.some((pattern) => pattern.test(message));
};

const checkForDirectRecommendationQuery = (message) => {
  return /直接推薦|隨便推薦|推薦幾個|給我推薦/.test(message);
};

module.exports = {
  extractProductKeywords,
  extractRequestedQuantity,
  cleanProductDescription,
  checkForProductRecommendationQuery,
  checkForDirectRecommendationQuery,
};
