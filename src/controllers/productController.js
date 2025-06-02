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
    res.status(500).json({ error: '伺服器問題' });
  }
};

// 拿特定商品
const getProductById = async (req, res) => {
  try {
    const id = req.params.id;
    if (isNaN(id)) {
      return res.status(400).json({ error: '無效的ID' });
    }

    const rows = await db.select().from(productsTable).where(eq(productsTable.id, id));
    if (rows.length === 0) {
      return res.status(404).json({ error: '查無此商品' });
    }
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: '伺服器問題' });
  }
};

// 新增商品
const createProduct = async (req, res) => {
  try {
    const { name, description, img, price, status, currentStock } = req.body;
    await db.insert(productsTable).values({
      name,
      description,
      img,
      price,
      status,
      currentStock,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    res.json('成功新增商品');
  } catch (err) {
    res.status(500).json({ error: '伺服器問題' });
  }
};

// 修改商品
const updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, description, img, price, status, currentStock } = req.body;
    await db
      .update(productsTable)
      .set({
        name,
        description,
        img,
        price,
        status,
        currentStock,
        updatedAt: new Date(),
      })
      .where(eq(productsTable.id, id));
    res.json('成功更新商品');
  } catch (err) {
    res.status(500).json({ error: '伺服器問題' });
  }
};

// 刪除商品
const deleteProduct = async (req, res) => {
  try {
    await db.delete(productsTable).where(eq(productsTable.id, req.params.id));
    res.json('商品已刪除');
  } catch (err) {
    res.status(500).json({ error: '伺服器問題' });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
