require('express');
const db = require('../configs/db');
const { productsTable } = require('../models/productSchema');
const { eq } = require('drizzle-orm');

// 拿所有商品
const getAllProducts = async (req, res) => {
  try {
    const rows = await db.select().from(productsTable);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 拿特定商品
const getProductById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: '無效的ID' });
    }

    const rows = await db.select().from(productsTable).where(eq(productsTable.id, id));
    if (rows.length === 0) {
      return res.status(404).json({ error: '查無此商品' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 新增商品
const createProduct = async (req, res) => {
  try {
    const { refId, name, sku, description, price, status, stockOnHand } = req.body;
    if (
      !refId ||
      !name ||
      !sku ||
      !description ||
      price == null ||
      isNaN(price) ||
      !status ||
      stockOnHand == null ||
      isNaN(stockOnHand)
    ) {
      return res.status(400).json({ error: '缺少必要欄位或格式錯誤' });
    }

    const [insertedProduct] = await db
      .insert(productsTable)
      .values({
        refId,
        name,
        sku,
        description,
        price,
        status,
        stockOnHand,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    res.status(201).json(insertedProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 修改商品
const updateProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { refId, name, sku, description, price, status, stockOnHand } = req.body;
    if (
      !refId ||
      !name ||
      !sku ||
      !description ||
      price == null ||
      isNaN(price) ||
      !status ||
      stockOnHand == null ||
      isNaN(stockOnHand)
    ) {
      return res.status(400).json({ error: '缺少必要欄位或格式錯誤' });
    }

    const [insertedProduct] = await db
      .update(productsTable)
      .set({
        refId,
        name,
        sku,
        description,
        price,
        status,
        stockOnHand,
        updatedAt: new Date(),
      })
      .where(eq(productsTable.id, id))
      .returning();
    res.status(200).json(insertedProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 刪除商品
const deleteProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: '無效的ID' });
    }
    const deletedRows = await db.delete(productsTable).where(eq(productsTable.id, id)).returning();
    if (deletedRows.length === 0) {
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
