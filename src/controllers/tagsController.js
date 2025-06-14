// src/controllers/tagsController.js
const { distinct, eq, like, and, inArray } = require('drizzle-orm');
const db = require('../configs/db'); // 引入 db 實例

const { productsTable } = require('../models/productSchema');
const { tagsTable } = require('../models/tagSchema');
const { productTagSTable } = require('../models/productTagSchema');
const { productImagesTable } = require('../models/productImageSchema'); // 引入 productImagesTable

const getProductsWithCoverImages = async (productIds) => {
  const products = await db
    .select()
    .from(productsTable)
    .where(inArray(productsTable.id, productIds)); // 使用 inArray 篩選多個 ID

  const productCoverImages = await db
    .selectDistinctOn([productImagesTable.productId], {
      productId: productImagesTable.productId,
      coverImage: productImagesTable.imgUrl,
    })
    .from(productImagesTable)
    .where(
      and(inArray(productImagesTable.productId, productIds), eq(productImagesTable.isCover, true))
    );

  const productsWithCovers = products.map((product) => {
    const coverImage = productCoverImages.find((img) => img.productId === product.id);
    return {
      ...product,
      coverImage: coverImage ? coverImage.coverImage : null,
    };
  });

  return productsWithCovers;
};

const getTagTypes = async (req, res) => {
  try {
    const ips = await db.selectDistinct({ value: tagsTable.ip }).from(tagsTable);
    const brands = await db.selectDistinct({ value: tagsTable.brand }).from(tagsTable);
    const series = await db.selectDistinct({ value: tagsTable.series }).from(tagsTable);

    const uniqueIps = ips.map((item) => item.value).filter(Boolean);
    const uniqueBrands = brands.map((item) => item.value).filter(Boolean);
    const uniqueSeries = series.map((item) => item.value).filter(Boolean);

    res.json({
      ip: uniqueIps,
      brand: uniqueBrands,
      series: uniqueSeries,
    });
  } catch (error) {
    console.error('獲取標籤類型時發生錯誤:', error);
    res.status(500).json({ message: '內部伺服器錯誤', error: error.message });
  }
};

const getProductsByTag = async (req, res) => {
  const { type, value } = req.query;

  if (!type || !value) {
    console.log(`錯誤: 缺少 type 或 value 參數.`);
    return res.status(400).json({ message: '請提供 type 和 value 參數' });
  }

  try {
    let tagCondition;
    switch (type) {
      case 'ip':
        tagCondition = eq(tagsTable.ip, value);
        break;
      case 'brand':
        tagCondition = eq(tagsTable.brand, value);
        break;
      case 'series':
        tagCondition = eq(tagsTable.series, value);
        break;
      default:
        console.log(`錯誤: 無效的標籤類型 "${type}"`);
        return res.status(400).json({ message: '無效的標籤類型，請提供 ip, brand 或 series' });
    }

    const matchingTags = await db
      .select({ tagId: tagsTable.id })
      .from(tagsTable)
      .where(tagCondition);

    const tagIds = matchingTags.map((t) => t.tagId);

    if (tagIds.length === 0) {
      console.log('沒有找到匹配的標籤。返回空商品列表。');
      return res.json([]);
    }

    // 步驟 2: 從 product_tags 關聯表找出與這些 tagId 相關的 productId
    const productIdsFromTags = await db
      .select({ productId: productTagSTable.productId })
      .from(productTagSTable)
      .where(inArray(productTagSTable.tagId, tagIds));

    const filteredProductIds = productIdsFromTags.map((p) => p.productId);

    if (filteredProductIds.length === 0) {
      console.log('沒有找到與標籤關聯的商品。返回空商品列表。');
      return res.json([]);
    }

    const productsWithCovers = await getProductsWithCoverImages(filteredProductIds);

    res.json(productsWithCovers);
  } catch (error) {
    console.error(`根據標籤查詢商品時發生錯誤 (type: ${type}, value: ${value}):`, error);
    res.status(500).json({ message: '內部伺服器錯誤', error: error.message });
  } finally {
    console.log(`--- 請求處理結束 ---`);
  }
};

module.exports = {
  getTagTypes,
  getProductsByTag,
};
