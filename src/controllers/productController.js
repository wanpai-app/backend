const db = require('../configs/db');
const { productsTable } = require('../models/productSchema');
const { productImagesTable } = require('../models/productImageSchema');
const { favoritesTable } = require('../models/favoriteSchema');
const jwt = require('jsonwebtoken');

const { inArray, eq, and, asc } = require('drizzle-orm');
const { deleteProductImages } = require('../services/productImageService');
const { uploadProductImage } = require('../controllers/productImageController');

const getAllProducts = async (req, res) => {
  const isAdmin = req.user?.role === 'admin';

  try {
    const status = req.query.status;
    let query = db.select().from(productsTable).orderBy(productsTable.id);

    if (!isAdmin) {
      query = query.where(
        and(eq(productsTable.isDeleted, false), eq(productsTable.status, 'active'))
      );
    } else if (status && status !== 'all') {
      query = query.where(
        and(eq(productsTable.isDeleted, false), eq(productsTable.status, status))
      );
    } else if (isAdmin) {
      query = query.where(eq(productsTable.isDeleted, false));
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

    const productsWithCovers = products.map((p) => ({
      ...p,
      coverImage: coverMap.get(p.id) || null,
    }));

    res.json(productsWithCovers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getProductById = async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: '無效的ID' });

  const authHeader = req.headers['authorization'];
  let userId = null;

  if (authHeader) {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_fallback_secret');
    userId = decoded.id;
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

    let isFavorited = false;

    if (userId) {
      const favorite = await db
        .select()
        .from(favoritesTable)
        .where(and(eq(favoritesTable.userId, userId), eq(favoritesTable.productId, id)));

      isFavorited = favorite.length > 0;
    }
    const coverImage = images.find((img) => img.isCover) || null;

    const previewImages = images
      .filter((img) => !img.isCover)
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .slice(0, 2);

    res.json({
      ...product,
      images: {
        cover: coverImage,
        previews: previewImages,
      },
      isFavorited,
    });
  } catch {
    res.status(500).json({ error: '伺服器錯誤' });
  }
};

const createProduct = async (req, res) => {
  const coverFile = req.files?.cover?.[0];
  const previewFiles = req.files?.previews || [];

  try {
    await db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(productsTable)
        .values({
          name: req.body.name,
          sku: req.body.sku,
          description: req.body.description,
          price: req.body.price,
          status: req.body.status || 'draft',
        })
        .returning();

      if (coverFile) {
        await uploadProductImage(tx, inserted, coverFile, true);
      }

      for (const file of previewFiles) {
        await uploadProductImage(tx, inserted, file, false);
      }

      res.status(201).json(inserted);
    });
  } catch {
    res.status(500).json({ error: '新增商品失敗，請稍後再試' });
  }
};

const updateProduct = async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: '無效的ID' });

  const coverFile = req.files?.cover?.[0];
  const previewFiles = req.files?.previews || [];

  try {
    await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(productsTable)
        .set({
          name: req.body.name,
          sku: req.body.sku,
          description: req.body.description,
          price: req.body.price,
          status: req.body.status || 'active',
        })
        .where(eq(productsTable.id, id))
        .returning();

      if (!updated) throw new Error('找不到商品');

      if (coverFile) {
        await uploadProductImage(tx, updated, coverFile, true);
      }

      for (const file of previewFiles) {
        await uploadProductImage(tx, updated, file, false);
      }

      res.status(200).json(updated);
    });
  } catch {
    res.status(500).json({ error: '更新商品失敗' });
  }
};

const deleteProductById = async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: '無效的商品 ID' });

  try {
    await db.transaction(async (tx) => {
      await deleteProductImages(tx, id);

      const deleted = await tx.delete(productsTable).where(eq(productsTable.id, id));

      if (deleted.rowCount === 0) {
        throw new Error('找不到商品');
      }
    });

    res.json({ message: '商品與相關圖片已刪除' });
  } catch {
    res.status(500).json({ error: '刪除商品失敗' });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProductById,
};
