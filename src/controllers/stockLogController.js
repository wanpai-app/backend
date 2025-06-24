const db = require('../configs/db');
const { stockLogsTable } = require('../models/stockLogSchema');
const { productsTable } = require('../models/productSchema');
const { eq } = require('drizzle-orm');

const getAllStockLogs = async (req, res) => {
  try {
    const stockLogs = await db.select().from(stockLogsTable).orderBy(stockLogsTable.id);
    res.json(stockLogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getStockLogsByProduct = async (req, res) => {
  const productId = Number(req.params.id);
  try {
    const stockLogs = await db
      .select()
      .from(stockLogsTable)
      .where(eq(stockLogsTable.productId, productId));
    res.json(stockLogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getStockLogById = async (req, res) => {
  const stockLogId = Number(req.params.id);
  try {
    const stockLog = await db
      .select()
      .from(stockLogsTable)
      .where(eq(stockLogsTable.id, stockLogId));
    res.json(stockLog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createStockLog = async (req, res) => {
  const productId = Number(req.params.id);
  const { amountChange, reason } = req.body;
  const email = req.user.email;

  try {
    const product = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, productId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!product || product.isDeleted) {
      return res.status(404).json({ error: '找不到商品' });
    }
    const newStock = product.stockOnHand + amountChange;
    if (newStock < 0) return res.status(400).json({ error: '庫存不得小於零' });

    const newStockLog = await db.transaction(async (tx) => {
      const inserted = await tx
        .insert(stockLogsTable)
        .values({
          productId,
          amountAfter: newStock,
          amountChange,
          reason,
          email,
        })
        .returning();

      await tx
        .update(productsTable)
        .set({ stockOnHand: newStock })
        .where(eq(productsTable.id, productId));
      return inserted[0];
    });
    res.status(201).json({ newStockLog });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllStockLogs,
  getStockLogsByProduct,
  getStockLogById,
  createStockLog,
};
