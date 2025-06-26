const db = require('../configs/db');
const { productsTable } = require('../models/productSchema');
const { productImagesTable } = require('../models/productImageSchema');
const { inArray, eq, and } = require('drizzle-orm');
const { sql } = require('drizzle-orm');

const getRandomProducts = async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 4, 20);

  try {
    const products = await db
      .select()
      .from(productsTable)
      .where(and(eq(productsTable.isDeleted, false), eq(productsTable.status, 'active')))
      .orderBy(sql`RANDOM()`)
      .limit(limit);

    if (products.length === 0) return res.json([]);

    const productIds = products.map((p) => p.id);

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

    res.json(productsWithCovers);
  } catch (err) {
    res.status(500).json({ error: '取得隨機商品失敗', detail: err.message });
  }
};

module.exports = {
  getRandomProducts,
};
