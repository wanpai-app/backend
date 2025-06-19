const { uploadImage, deleteImage } = require('./s3UploadService');
const { productImagesTable } = require('../models/productImageSchema');
const { eq, sql } = require('drizzle-orm');

const getNextOrderIndex = async (tx, productId) => {
  const result = await tx
    .select({ maxIndex: sql`MAX(${productImagesTable.orderIndex})` })
    .from(productImagesTable)
    .where(eq(productImagesTable.productId, productId));

  const currentMax = result?.[0]?.maxIndex ?? -1;
  return currentMax + 1;
};

const createProductImage = async (tx, product, file, isCover = false) => {
  try {
    const s3Result = await uploadImage(file);
    const orderIndex = isCover ? 0 : await getNextOrderIndex(tx, product.id);

    await tx.insert(productImagesTable).values({
      productId: product.id,
      refId: product.refId,
      imgUrl: s3Result.Location,
      orderIndex,
      isCover,
      createdAt: sql`now()`,
      updatedAt: sql`now()`,
    });
  } catch (err) {
    console.error('圖片上傳失敗:', err);
    throw err;
  }
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

const deleteProductImage = async (tx, imageId) => {
  const [img] = await tx
    .select()
    .from(productImagesTable)
    .where(eq(productImagesTable.id, imageId));
  if (!img) return null;

  await deleteImage(img.imgUrl);
  await tx.delete(productImagesTable).where(eq(productImagesTable.id, imageId));
  return img;
};

module.exports = {
  createProductImage,
  deleteProductImages,
  deleteProductImage,
};
