const { eq, inArray, sql, and } = require('drizzle-orm');
const { tagsTable, typeEnum } = require('../models/tagsSchema');
const { productsTable, statusEnum } = require('../models/productSchema');
const { productTagSTable } = require('../models/productTagSchema');
const db = require('../configs/db');

const tagsController = {
  getAllFilterTags: async (req, res) => {
    try {
      // 獲取所有 'brand' 類型的標籤 (tagname 和 id)
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

      res.status(200).json({ brands, series, ip });
    } catch (error) {
      console.error('Error fetching filter tags:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  getProductsByTagnames: async (req, res) => {
    const { tagname } = req.query;

    try {
      let selectedTagNames = [];
      let selectedTagIds = [];

      if (tagname) {
        selectedTagNames = tagname.split(',');

        const tags = await db
          .select({
            id: tagsTable.id,
            tagname: tagsTable.tagname,
          })
          .from(tagsTable)
          .where(inArray(tagsTable.tagname, selectedTagNames))
          .execute();

        selectedTagIds = tags.map((tag) => tag.id);

        if (selectedTagIds.length !== selectedTagNames.length) {
          console.warn('Some provided tagnames did not match any existing tags.');
        }
      }

      if (selectedTagIds.length === 0) {
        const allActiveProducts = await db
          .select()
          .from(productsTable)
          .where(eq(productsTable.status, statusEnum.enumValues[1]))
          .execute();
        return res.status(200).json({ products: allActiveProducts });
      }

      const productsWithMatchingTags = await db
        .select({
          productId: productTagSTable.productId,
        })
        .from(productTagSTable)
        .where(inArray(productTagSTable.tagId, selectedTagIds))
        .groupBy(productTagSTable.productId)
        .having((fields) => eq(sql`count(${fields.productId})`, selectedTagIds.length)) // 確保每個分組的 productId 數量等於選定標籤的總數
        .execute();

      const productIds = productsWithMatchingTags.map((p) => p.productId);

      // 如果沒有找到任何符合所有標籤的產品
      if (productIds.length === 0) {
        return res.status(200).json({ products: [] });
      }

      // 根據篩選出的產品 ID 獲取產品詳細資訊，並且只顯示狀態為 'active' 的商品
      const products = await db
        .select()
        .from(productsTable)
        .where(
          and(
            inArray(productsTable.id, productIds), // 產品 ID 必須在篩選出的列表中
            eq(productsTable.status, statusEnum.enumValues[1]) // 產品狀態必須是 'active'
          )
        )
        .execute();

      res.status(200).json({ products });
    } catch (error) {
      console.error('Error fetching products by tagnames:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
};

module.exports = tagsController;
