const db = require('../configs/db');
const { productsTable } = require('../models/productSchema');
const { productImagesTable } = require('../models/productImageSchema');
const { favoritesTable } = require('../models/favoriteSchema');
const jwt = require('jsonwebtoken');

const { inArray, eq, and, asc } = require('drizzle-orm');
const isAdmin = require('../middleware/isAdmin');
const {
  createProductImage,
  updateProductImage,
  deleteProductImages,
} = require('./productImageController');

const getAllProducts = async (req, res) => {
  const status = req.query.status;
  const conditions = [eq(productsTable.isDeleted, false)];

  if (!isAdmin) {
    conditions.push(eq(productsTable.status, 'active'));
  } else if (status && status !== 'all') {
    conditions.push(eq(productsTable.status, status));
  }

  let query = db
    .select()
    .from(productsTable)
    .where(and(...conditions))
    .orderBy(productsTable.id);

  try {
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
        and(
          inArray(productImagesTable.productId, productIds),
          eq(productImagesTable.isCover, true)
        )
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

  // ✅ 嘗試解析 JWT，不強制登入
  const authHeader = req.headers['authorization'];
  let userId = null;

  if (authHeader) {
    const token = authHeader.split(' ')[1]; // 取得 "Bearer token" 中的 token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_fallback_secret');
      userId = decoded.id; // 解出使用者 ID
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      // token 錯誤，不做處理，userId 保持為 null
    }
  }

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
    let isFavorited = false;

    if (userId) {
      const favorite = await db
        .select()
        .from(favoritesTable)
        .where(and(eq(favoritesTable.userId, userId), eq(favoritesTable.productId, id)));

      isFavorited = favorite.length > 0;
    }

    res.json({
      ...product,
      images: {
        cover: coverImage,
        previews: previewImages,
      },
      isFavorited,
    });
  } catch (err) {
    console.error('查詢商品錯誤:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
};

const createProduct = async (req, res) => {
  try {
    await db.transaction(async (tx) => {
      const [insertedProduct] = await tx
        .insert(productsTable)
        .values({
          ...req.body,
          price: Number(req.body.price),
          createdAt: sql`now()`,
          updatedAt: sql`now()`,
        })
        .returning();

      if (req.file) await createProductImage(tx, insertedProduct, req.file);

      res.status(201).json(insertedProduct);
    });
  } catch (err) {
    console.error('建立商品失敗', err);
    res.status(500).json({ error: '建立商品失敗', message: err.message });
  }
};

const updateProduct = async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: '無效的ID' });

  try {
    await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(productsTable)
        .set({
          ...req.body,
          price: req.body.price ? Number(req.body.price) : undefined,
          updatedAt: sql`now()`,
        })
        .where(eq(productsTable.id, id))
        .returning();

      if (!updated) throw new Error('找不到要更新的商品');

      if (req.file) await updateProductImage(tx, id, updated.refId, req.file);

      res.status(200).json(updated);
    });
  } catch (err) {
    console.error('更新商品失敗', err);
    res.status(500).json({ error: '更新商品失敗', message: err.message });
  }
};

const deleteProduct = async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: '無效的ID' });

  try {
    await db.transaction(async (tx) => {
      const product = await tx.select().from(productsTable).where(eq(productsTable.id, id)).limit(1);
      if (product.length === 0) throw new Error('查無此商品');

      await tx
        .update(productsTable)
        .set({ isDeleted: true, updatedAt: new Date() })
        .where(eq(productsTable.id, id));

      await deleteProductImages(tx, id);

      res.json({ message: '商品已刪除' });
    });
  } catch (err) {
    console.error('刪除商品失敗', err);
    res.status(500).json({ error: '刪除商品失敗', message: err.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
