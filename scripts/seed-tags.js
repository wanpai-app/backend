const { eq } = require('drizzle-orm');
const db = require('../src/configs/db');
const { tagsTable, typeEnum } = require('../src/models/tagsSchema');
const { productsTable } = require('../src/models/productSchema');
const { productTagSTable } = require('../models/productTagSchema');

async function seedTags() {
  try {
    console.log('🌱 開始添加 tags 資料...');

    // 檢查是否已有 tags
    const existingTags = await db.select().from(tagsTable);
    console.log('📋 現有 tags 數量:', existingTags.length);

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
      console.log(
        '✅ 成功添加 tags:',
        insertedTags.map((t) => t.tagname)
      );
    }

    // 檢查產品數量
    const products = await db.select().from(productsTable);
    console.log('📦 產品數量:', products.length);

    if (products.length > 0) {
      // 檢查產品標籤關聯
      const productTags = await db.select().from(productTagSTable);
      console.log('🏷️ 現有產品標籤關聯數量:', productTags.length);

      if (productTags.length === 0) {
        // 獲取所有 tags
        const allTags = await db.select().from(tagsTable);
        console.log('🏷️ 所有 tags:', allTags);

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
          console.log('✅ 成功添加產品標籤關聯:', insertedRelations.length, '個');
        }
      }
    }

    console.log('🎉 Tags 資料添加完成！');
  } catch (error) {
    console.error('❌ 添加 tags 資料失敗:', error);
  } finally {
    process.exit(0);
  }
}

seedTags();
