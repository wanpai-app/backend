const { eq } = require('drizzle-orm');
const db = require('../src/configs/db');
const { tagsTable, typeEnum } = require('../src/models/tagsSchema');
const { productsTable } = require('../src/models/productSchema');
const { productTagSTable } = require('../src/models/productTagSchema');

async function checkTags() {
  try {
    // 檢查所有 tags
    const allTags = await db.select().from(tagsTable);

    // 檢查 series 類型的 tags
    const seriesTags = await db
      .select()
      .from(tagsTable)
      .where(eq(tagsTable.type, typeEnum.enumValues[2]));

    // 檢查產品數量
    const products = await db.select().from(productsTable);

    // 檢查產品標籤關聯
    const productTags = await db.select().from(productTagSTable);

    if (productTags.length > 0) {
      // 檢查特定產品的標籤
      const firstProductId = productTags[0].productId;
      const productWithTags = await db
        .select({
          productId: productTagSTable.productId,
          tagId: productTagSTable.tagId,
          tagName: tagsTable.tagname,
          tagType: tagsTable.type,
        })
        .from(productTagSTable)
        .leftJoin(tagsTable, eq(productTagSTable.tagId, tagsTable.id))
        .where(eq(productTagSTable.productId, firstProductId));
    }
  } catch (error) {
    console.error(' 檢查失敗:', error);
  } finally {
    process.exit(0);
  }
}

checkTags();
