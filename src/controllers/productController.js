const db = require('../configs/db');
const { productsTable } = require('../models/productSchema');
const { eq } = require('drizzle-orm');

const getAllProducts = async (req, res) => {
  try {
    const rows = await db.select().from(productsTable).where(eq(productsTable.status, 'active'));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getProductById = async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: '無效的ID' });

  try {
    const rows = await db.select().from(productsTable).where(eq(productsTable.id, id));
    if (rows.length === 0) return res.status(404).json({ error: '查無此商品' });

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
      .delete(productsTable)
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