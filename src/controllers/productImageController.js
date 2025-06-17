const db = require('../configs/db');
const { uploadImage, deleteImage } = require('../utils/s3Util');
const { productImagesTable } = require('../models/productImageSchema');
const { eq, sql } = require('drizzle-orm');

const createProductImage = async (tx, product, file) => {
  try {
  const s3Result = await uploadImage(file);
  await tx.insert(productImagesTable).values({
    productId: product.id,
    refId: product.refId,
    imgUrl: s3Result.Location,
    orderIndex: 0,
    isCover: true,
    createdAt: sql`now()`,
    updatedAt: sql`now()`,
  });
  } catch (err) {
    console.error("❌ Failed to create product image:", err);
    throw err; // 丟回上層讓交易回滾
  }
};

const updateProductImage = async (tx, productId, refId, file) => {
  const [existingCover] = await tx
    .select()
    .from(productImagesTable)
    .where(eq(productImagesTable.productId, productId))
    .where(eq(productImagesTable.isCover, true))
    .limit(1);

  if (existingCover) {
    try {
      await deleteImage(existingCover.imgUrl);
      await tx.delete(productImagesTable).where(eq(productImagesTable.id, existingCover.id));
    } catch (err) {
      console.warn('刪除舊封面失敗:', err.message);
    }
  }

  const s3Result = await uploadImage(file);
  await tx.insert(productImagesTable).values({
    productId,
    refId,
    imgUrl: s3Result.Location,
    orderIndex: 0,
    isCover: true,
    createdAt: sql`now()`,
    updatedAt: sql`now()`,
  });
};

const deleteProductImages = async (tx, productId) => {
  const images = await tx
    .select()
    .from(productImagesTable)
    .where(eq(productImagesTable.productId, productId));

  await tx.delete(productImagesTable).where(eq(productImagesTable.productId, productId));

  for (const img of images) {
    try {
      await deleteImage(img.imgUrl);
    } catch (err) {
      console.error('刪除S3圖片失敗:', img.imgUrl, err);
    }
  }
};

const deleteProductImage = async (req, res) => {
  const id = Number(req.params.id);

  const [img] = await db.select().from(productImagesTable).where(eq(productImagesTable.id, id));
  if (!img) return res.status(404).json({ error: '找不到圖片' });

  await deleteImage(img.imgUrl); // 刪 S3
  await db.delete(productImagesTable).where(eq(productImagesTable.id, id)); // 刪 DB

  res.json({ message: '圖片已刪除' });
};

module.exports = {
  createProductImage,
  updateProductImage,
  deleteProductImages,
  deleteProductImage,
};
