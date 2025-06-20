const { eq } = require('drizzle-orm');
const db = require('../src/configs/db');
const { tagsTable, typeEnum } = require('../src/models/tagsSchema');
const { productsTable } = require('../src/models/productSchema');
const { productTagSTable } = require('../models/productTagSchema');

async function seedTags() {
  try {
    const existingTags = await db.select().from(tagsTable);

    if (existingTags.length === 0) {
      // 添加一些基本的 series tags
      const seriesTags = [
        { tagname: '模型', type: typeEnum.enumValues[2] },
        { tagname: '公仔', type: typeEnum.enumValues[2] },
        { tagname: '立牌', type: typeEnum.enumValues[2] },
        { tagname: '雕像', type: typeEnum.enumValues[2] },
        { tagname: '抱枕', type: typeEnum.enumValues[2] },
        { tagname: '徽章', type: typeEnum.enumValues[2] },
        { tagname: '吊飾', type: typeEnum.enumValues[2] },
        { tagname: 'T-shirt', type: typeEnum.enumValues[2] },
      ];

      const insertedTags = await db.insert(tagsTable).values(seriesTags).returning();
    }

    // 檢查產品數量
    const products = await db.select().from(productsTable);

    if (products.length > 0) {
      // 檢查產品標籤關聯
      const productTags = await db.select().from(productTagSTable);

      if (productTags.length === 0) {
        // 獲取所有 tags
        const allTags = await db.select().from(tagsTable);

        // 為前幾個產品添加隨機標籤
        const sampleProducts = products.slice(0, Math.min(5, products.length));
        const sampleTags = allTags.slice(0, Math.min(3, allTags.length));

        const productTagRelations = [];
        for (const product of sampleProducts) {
          // 為每個產品隨機分配 1-2 個標籤
          const numTags = Math.floor(Math.random() * 2) + 1;
          const selectedTags = sampleTags.slice(0, numTags);

          for (const tag of selectedTags) {
            productTagRelations.push({
              productId: product.id,
              tagId: tag.id,
            });
          }
        }

        if (productTagRelations.length > 0) {
          const insertedRelations = await db
            .insert(productTagSTable)
            .values(productTagRelations)
            .returning();
        }
      }
    }
  } catch (error) {
    console.error(' 添加 tags 資料失敗:', error);
  } finally {
    process.exit(0);
  }
}

seedTags();
