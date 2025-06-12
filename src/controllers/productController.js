const db = require('../configs/db');
const { productsTable } = require('../models/productSchema');
const { productImagesTable } = require('../models/productImageSchema');
const { inArray, eq, and, asc } = require('drizzle-orm');

const getAllProducts = async (req, res) => {
  try {
    const status = req.query.status;
    let query = db.select().from(productsTable).where(eq(productsTable.isDeleted, false));

    if (status && status !== 'all') {
      query = query.where(eq(productsTable.status, status));
    }

    const products = await query;

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

    const missingCoverIds = productIds.filter((id) => !coverMap.has(id));

    if (missingCoverIds.length > 0) {
      const fallbackImages = await db
        .select({
          productId: productImagesTable.productId,
          imgUrl: productImagesTable.imgUrl,
          orderIndex: productImagesTable.orderIndex,
        })
        .from(productImagesTable)
        .where(inArray(productImagesTable.productId, missingCoverIds))
        .orderBy(asc(productImagesTable.productId), asc(productImagesTable.orderIndex));

      const fallbackMap = new Map();
      for (const img of fallbackImages) {
        if (!fallbackMap.has(img.productId)) {
          fallbackMap.set(img.productId, img.imgUrl);
        }
      }

      for (const [pid, url] of fallbackMap) {
        coverMap.set(pid, url);
      }
    }

    const productsWithCovers = products.map((p) => ({
      ...p,
      coverImage: coverMap.get(p.id) || null,
    }));

    res.json(productsWithCovers);
  } catch (err) {
    console.error('getAllProducts 錯誤:', err);
    res.status(500).json({ error: err.message });
  }
};

const getProductById = async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: '無效的ID' });

  try {
    const rows = await db.select().from(productsTable).where(eq(productsTable.id, id));

    if (rows.length === 0) return res.status(404).json({ error: '查無此商品' });

    const product = rows[0];

    const images = await db
      .select()
      .from(productImagesTable)
      .where(eq(productImagesTable.productId, id))
      .orderBy(asc(productImagesTable.orderIndex));

    const coverImage =
      images.find((img) => img.isCover) || images.find((img) => img.orderIndex === 0) || images[0];

    const previewImages = images.filter((img) => img.id !== coverImage?.id).slice(0, 2);

    res.json({
      ...product,
      images: {
        cover: coverImage,
        previews: previewImages,
        // all: images,
      },
    });
  } catch (err) {
    console.error('查詢商品錯誤:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
};

const createProduct = async (req, res) => {
  try {
    const [inserted] = await db
      .insert(productsTable)
      .values({
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    res.status(201).json(inserted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateProduct = async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: '無效的ID' });

  try {
    const [updated] = await db
      .update(productsTable)
      .set({
        ...req.body,
        updatedAt: new Date(),
      })
      .where(eq(productsTable.id, id))
      .returning();

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteProduct = async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: '無效的ID' });

  try {
    const deleted = await db
      .update(productsTable)
      .set({ isDeleted: true })
      .where(eq(productsTable.id, id))
      .returning();

    if (deleted.length === 0) {
      return res.status(404).json({ error: '查無此商品' });
    }

    res.json({ message: '商品已刪除' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
