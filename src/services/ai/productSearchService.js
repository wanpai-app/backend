const db = require('../../configs/db');
const { productsTable } = require('../../models/productSchema');
const { tagsTable } = require('../../models/tagsSchema');
const { productTagSTable } = require('../../models/productTagSchema');
const { productImagesTable } = require('../../models/productImageSchema');
const { eq, and, ilike, inArray, or, sql } = require('drizzle-orm');

const keywordMapping = {
  變形金剛: ['變形金剛', 'Transformer'],
  無職轉生: ['無職轉生', '無職轉生～到了異世界就拿出真本事～', '希露菲葉特'],
  遊戲王: ['遊戲王', 'Yu-Gi-Oh'],
  百獸王: ['百獸王', 'GOLION', '百獸王GOLION'],
  河馬: ['河馬', 'hippo'],
  閃電霹靂車: ['閃電霹靂車'],
  數碼寶貝: ['數碼寶貝', 'Digimon'],
  藍寶堅尼: ['藍寶堅尼', 'Lamborghini', 'Aventador'],
  'R35 GT-R': ['R35', 'GT-R', 'GTR'],
  'VERTEX JZS161 Aristo': ['VERTEX JZS161 Aristo', 'Aristo'],
  RE雨宮: ['RE雨宮'],
  'Secret BNR34 Skyline GT-R': ['Secret BNR34', 'Skyline GT-R', 'BNR34'],
  'Greddy&Rocket Bunny Enkei': ['Greddy', 'Rocket Bunny', 'Enkei'],
  福斯金龜車: ['福斯金龜車', 'Volkswagen'],
  孤獨搖滾: ['孤獨搖滾'],
  狼與辛香料: ['狼與辛香料'],
  魔物獵人: ['魔物獵人', 'Monster Hunter', 'MonsterHunter'],
  Overlord: ['Overlord', 'overlord', '雅兒貝德'],
  魔女之旅: ['魔女之旅'],
  不時輕聲地以俄語遮羞的鄰座艾莉同學: ['不時輕聲地以俄語遮羞的鄰座艾莉同學', '艾莉同學'],
  初音未來: ['初音未來', 'Hatsune Miku', 'Miku'],
  假面騎士: ['假面騎士', 'Kamen Rider'],
  約會大作戰: ['約會大作戰', 'Date A Live'],
  蔚藍檔案: ['蔚藍檔案', 'Blue Archive'],
  超人力霸王: ['超人力霸王', 'Ultraman'],
  犬夜叉: ['犬夜叉', 'Inuyasha'],
  莉可麗絲: ['莉可麗絲', 'LycoReco'],
  哥吉拉: ['哥吉拉', 'Godzilla'],
  月刊少女野崎同學: ['月刊少女野崎同學', '野崎同學'],
  hololive: ['hololive'],
  探險活寶: ['探險活寶', 'Adventure Time'],
  瑞克和莫蒂: ['瑞克和莫蒂', 'Rick and Morty'],
  熊熊遇見你: ['熊熊遇見你', 'We Bare Bears'],
  '崩壞:星穹鐵道': ['崩壞:星穹鐵道', '星穹鐵道', 'Honkai Star Rail'],
  史努比: ['史努比', 'Snoopy'],
  精靈寶可夢: ['精靈寶可夢', 'Pokemon', '寶可夢', '皮卡丘'],
  我的英雄學院: ['我的英雄學院', '綠谷出久', '爆豪勝己'],
  '勝利女神：妮姬': ['勝利女神：妮姬', '勝利女神', '妮姬', 'NIKKE', '阿妮斯'],
  青島: ['青島', 'AOSHIMA', 'Aoshima'],
  'KENMARY WORKS': ['KENMARY WORKS', 'KENMARY', 'Ken Mary'],
  BellFine: ['BellFine', 'bellfine', 'Bell Fine'],
};

const searchProductsByName = async (keyword) => {
  try {
    // 特殊處理：避免「獵人」單獨匹配到「魔物獵人」
    if (keyword === '獵人' || keyword.toLowerCase() === 'hunter') {
      return [];
    }

    // 檢查是否有關鍵詞映射
    let searchTerms = [keyword];
    for (const [key, mappedTerms] of Object.entries(keywordMapping)) {
      if (mappedTerms.includes(keyword) || key === keyword) {
        searchTerms = [...new Set([...searchTerms, ...mappedTerms])];
        break;
      }
    }

    let allResults = new Map();

    for (const term of searchTerms) {
      // 完全匹配搜尋
      const exactResults = await db
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

      exactResults.forEach((product) => {
        allResults.set(product.id, { ...product, matchType: 'exact' });
      });
    }

    let products = Array.from(allResults.values());

    // 添加封面圖片
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
      products = products.map((p) => ({ ...p, coverImage: coverMap.get(p.id) || null }));
    }

    return products;
  } catch (error) {
    console.error('搜尋商品時發生錯誤:', error);
    return [];
  }
};

const searchProductsByTags = async (keyword) => {
  try {
    console.log(`正在以標籤搜尋商品: ${keyword}`);

    // 基於實際資料庫的關鍵詞映射
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
      熊熊遇見你: [
        '熊熊遇見你',
        'We Bare Bears',
        '自拍',
        '派對',
        '甜甜圈',
        '飄飄玩',
        '逗趣',
        '歡樂',
      ],
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
      'Good Smile': [
        'Good Smile',
        'GSC',
        'Good Smile Company',
        'MODEROID',
        'POP UP PARADE',
        'figma',
      ],
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

    // 找出匹配的主要關鍵詞
    let targetKeyword = null;
    const allMappings = Object.entries(keywordMapping);

    // 按關鍵詞長度排序，優先匹配較長的關鍵詞
    const sortedMappings = allMappings.sort((a, b) => {
      const maxLenA = Math.max(...a[1].map((k) => k.length));
      const maxLenB = Math.max(...b[1].map((k) => k.length));
      return maxLenB - maxLenA;
    });

    for (const [mainKeyword, variants] of sortedMappings) {
      for (const variant of variants) {
        if (keyword.includes(variant)) {
          targetKeyword = mainKeyword;
          break;
        }
      }
      if (targetKeyword) break;
    }

    if (!targetKeyword) {
      console.log(`沒有找到匹配的關鍵詞映射: ${keyword}`);
      return [];
    }

    console.log(`關鍵詞 "${keyword}" 映射到: ${targetKeyword}`);

    // 查找對應的標籤
    const matchingTags = await db
      .select()
      .from(tagsTable)
      .where(eq(tagsTable.tagname, targetKeyword));

    if (matchingTags.length === 0) {
      console.log(`沒有找到標籤: ${targetKeyword}`);
      return [];
    }

    const tagIds = matchingTags.map((tag) => tag.id);
    console.log(`找到標籤ID: ${tagIds}`);

    // 查找關聯的商品
    const productTagRelations = await db
      .select()
      .from(productTagSTable)
      .where(inArray(productTagSTable.tagId, tagIds));

    if (productTagRelations.length === 0) {
      console.log(`沒有找到使用此標籤的商品`);
      return [];
    }

    const productIds = [...new Set(productTagRelations.map((pt) => pt.productId))];
    console.log(`找到相關商品ID: ${productIds}`);

    // 查找商品詳細資訊
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
      .limit(20);

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
    console.error('標籤搜尋時發生錯誤:', error);
    return [];
  }
};

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
                  ilike(productsTable.name, `%${keyword}`)
                )
              )
              .limit(10)
          );
        }

        const results = await Promise.all(searchQueries);
        results.flat().forEach((product) => {
          allResults.set(product.id, product);
        });
      }
    }

    let products = Array.from(allResults.values());

    // 添加封面圖片
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
      products = products.map((p) => ({ ...p, coverImage: coverMap.get(p.id) || null }));
    }

    return products;
  } catch (error) {
    console.error('模糊搜尋時發生錯誤:', error);
    return [];
  }
};

const searchSeriesProducts = async (seriesKeyword, requestedQuantity = 3) => {
  try {
    // 系列關鍵詞映射到標籤名稱
    const seriesTagMapping = {
      組裝模型: ['組裝模型'],
      PVC: ['PVC'],
      可動完成品: ['可動完成品'],
      景品: ['景品'],
      黏土人: ['黏土人'],
      GK: ['GK'],
    };

    const tagNames = seriesTagMapping[seriesKeyword];
    if (!tagNames || tagNames.length === 0) {
      return [];
    }

    // 根據標籤名稱查找標籤ID
    const matchingTags = await db
      .select()
      .from(tagsTable)
      .where(or(...tagNames.map((tagName) => eq(tagsTable.tagname, tagName))));

    if (matchingTags.length === 0) {
      return [];
    }

    // 查找關聯的商品
    const tagIds = matchingTags.map((tag) => tag.id);
    const productTagRelations = await db
      .select()
      .from(productTagSTable)
      .where(inArray(productTagSTable.tagId, tagIds));

    if (productTagRelations.length === 0) {
      return [];
    }

    // 查找所有相關商品
    const productIds = [...new Set(productTagRelations.map((pt) => pt.productId))];
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

    if (allProducts.length === 0) {
      return [];
    }

    // 隨機選擇指定數量的商品
    const shuffled = allProducts.sort(() => 0.5 - Math.random());
    const selectedProducts = shuffled.slice(0, Math.min(requestedQuantity, allProducts.length));

    // 添加封面圖片
    const activeProductIds = selectedProducts.map((p) => p.id);
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
    const productsWithCovers = selectedProducts.map((p) => ({
      ...p,
      coverImage: coverMap.get(p.id) || null,
    }));

    return productsWithCovers;
  } catch (error) {
    console.error('系列商品搜尋時發生錯誤:', error);
    return [];
  }
};

const getRandomProductsFromDB = async () => {
  try {
    const randomProducts = await db
      .select()
      .from(productsTable)
      .where(and(eq(productsTable.isDeleted, false), eq(productsTable.status, 'active')))
      .orderBy(sql`RANDOM()`)
      .limit(8);

    // 添加封面圖片
    if (randomProducts.length > 0) {
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
      return randomProducts.map((p) => ({ ...p, coverImage: coverMap.get(p.id) || null }));
    }

    return randomProducts;
  } catch (error) {
    console.error('獲取隨機商品時發生錯誤:', error);
    return [];
  }
};

module.exports = {
  searchProductsByName,
  searchProductsByTags,
  searchByTagType,
  fuzzySearchProducts,
  searchSeriesProducts,
  getRandomProductsFromDB,
};
