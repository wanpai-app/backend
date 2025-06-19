const { db } = require('../configs/db');
const { createProductImage, deleteProductImage } = require('../services/productImageService');
const { productsTable } = require('../models/productSchema');
const { productImagesTable } = require('../models/productImageSchema');
const { eq, asc } = require('drizzle-orm');

const uploadProductImage = async (req, res) => {
  const productId = Number(req.params.productId);
  if (!productId || isNaN(productId)) {
    return res.status(400).json({ error: '無效的商品 ID' });
  }

  const file = req.file;
  const isCover = req.body.isCover === 'true';

  if (!file) return res.status(400).json({ error: '缺少圖片檔案' });

  try {
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId));

    if (!product) return res.status(404).json({ error: '找不到商品' });
    if (product.isDeleted) {
      return res.status(400).json({ error: '商品已被刪除，無法上傳圖片' });
    }

    await db.transaction(async (tx) => {
      await createProductImage(tx, product, file, isCover);
    });

    res.status(201).json({ message: '圖片上傳成功' });
  } catch (err) {
    console.error('圖片上傳失敗:', err);
    res.status(500).json({ error: '圖片上傳失敗' });
  }
};

const removeProductImage = async (req, res) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: '無效的圖片 ID' });
  }

  try {
    await db.transaction(async (tx) => {
      const deleted = await deleteProductImage(tx, id);
      if (!deleted) return res.status(404).json({ error: '找不到圖片' });
    });

    res.json({ message: '圖片已刪除' });
  } catch (err) {
    console.error('刪除圖片失敗:', err);
    res.status(500).json({ error: '刪除圖片失敗' });
  }
};

const getProductImagesByProductId = async (req, res) => {
  const productId = Number(req.params.productId);
  if (!productId || isNaN(productId)) {
    return res.status(400).json({ error: '無效的商品 ID' });
  }

  try {
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId));

    if (!product) {
      return res.status(404).json({ error: '找不到商品' });
    }

    const images = await db
      .select()
      .from(productImagesTable)
      .where(eq(productImagesTable.productId, productId))
      .orderBy(asc(productImagesTable.orderIndex));

    res.json(images);
  } catch (err) {
    console.error('取得圖片清單失敗:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
};

module.exports = {
  uploadProductImage,
  removeProductImage,
  getProductImagesByProductId,
};
