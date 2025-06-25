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
  'KENMARY WORKS': ['KENMARY WORKS'],
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
    // 搜尋標籤
    const matchingTags = await db
      .select()
      .from(tagsTable)
      .where(ilike(tagsTable.tagname, `%${keyword}%`));

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
