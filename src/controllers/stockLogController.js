const db = require('../configs/db');
const { stockLogsTable } = require('../models/stockLogSchema');
const { productsTable } = require('../models/productSchema');
const { productImagesTable } = require('../models/productImageSchema');
const { eq, and, gte, lte, desc, asc, count } = require('drizzle-orm');

const getAllStockLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      productId,
      reason,
      startDate,
      endDate,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const conditions = [];

    if (productId) {
      conditions.push(eq(stockLogsTable.productId, Number(productId)));
    }

    if (reason) {
      conditions.push(eq(stockLogsTable.reason, reason));
    }

    if (startDate) {
      conditions.push(gte(stockLogsTable.createdAt, new Date(startDate)));
    }

    if (endDate) {
      conditions.push(lte(stockLogsTable.createdAt, new Date(endDate)));
    }

    let query = db.select().from(stockLogsTable);

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const orderBy = order === 'asc' ? asc : desc;
    query = query.orderBy(orderBy(stockLogsTable[sortBy] || stockLogsTable.createdAt));

    const offset = (Number(page) - 1) * Number(limit);
    query = query.limit(Number(limit)).offset(offset);

    const stockLogs = await query;

    let countQuery = db.select({ count: count() }).from(stockLogsTable);
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }
    const totalResult = await countQuery;
    const total = totalResult[0].count;

    res.json({
      data: stockLogs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
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
      .where(eq(stockLogsTable.productId, productId))
      .orderBy(desc(stockLogsTable.createdAt));

    const product = await db
      .select({
        id: productsTable.id,
        name: productsTable.name,
      })
      .from(productsTable)
      .where(eq(productsTable.id, productId));

    const coverImage = await db
      .select({
        id: productImagesTable.id,
        imgUrl: productImagesTable.imgUrl,
      })
      .from(productImagesTable)
      .where(and(eq(productImagesTable.productId, productId), eq(productImagesTable.isCover, true)))
      .limit(1);
    res.json({
      product: product[0] || null,
      stockLogs,
      coverImage: coverImage[0] || null,
    });
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
