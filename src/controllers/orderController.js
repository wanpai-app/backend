const db = require('../configs/db');
const { ordersTable } = require('../models/orderSchema');
const { findOrders } = require('../services/orderService');
const { getOrderWithItems } = require('../services/orderService');
const { eq, and } = require('drizzle-orm');

const getAdminOrders = async (req, res) => {
  const status = req.query.status;
  const conditions = [eq(ordersTable.isDeleted, false)];

  if (status && status !== 'all') {
    conditions.push(eq(ordersTable.status, status));
  }

  try {
    const orders = await db
      .select()
      .from(ordersTable)
      .where(and(...conditions));
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createOrder = async (req, res) => {
  try {
    const [insertedOrder] = await db
      .insert(ordersTable)
      .values({
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    res.status(201).json(insertedOrder);
  } catch (err) {
    console.error('建立訂單失敗:', err);
    res.status(500).json({ error: err.message });
  }
};

const getOrderById = async (req, res) => {
  const userId = req.user?.id;
  const isAdmin = req.user?.role === 'admin';
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: '訂單 ID 無效' });
  }

  try {
    const order = await getOrderWithItems(id);
    if (!order) {
      return res.status(404).json({ message: '找不到該訂單' });
    }

    if (!isAdmin && order.userId !== userId) {
      return res.status(403).json({ error: '無權查看此訂單' });
    }

    res.json(order);
  } catch (err) {
    console.error('查詢單筆訂單失敗:', err);
    res.status(500).json({ error: err.message });
  }
};

const updateOrder = async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: '無效的 ID' });

  try {
    const [updatedOrder] = await db
      .update(ordersTable)
      .set({
        ...req.body,
        updatedAt: new Date(),
      })
      .where(eq(ordersTable.id, id))
      .returning();

    res.status(200).json(updatedOrder);
  } catch (err) {
    console.error('更新訂單失敗:', err);
    res.status(500).json({ error: err.message });
  }
};

const softDeleteOrder = async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: '無效的 ID' });

  try {
    const [deleted] = await db
      .update(ordersTable)
      .set({ isDeleted: true })
      .where(eq(ordersTable.id, id))
      .returning();

    res.status(201).json(deleted);
  } catch (err) {
    console.error('軟刪除訂單失敗:', err);
    res.status(500).json({ error: err.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const filters = req.query;

    const orders = await findOrders({ filters });
    res.json(orders);
  } catch (err) {
    console.error('取得所有訂單失敗:', err);
    res.status(500).json({ error: err.message });
  }
};
const getUserOrders = async (req, res) => {
  const userId = req.user?.id;
  const filters = req.query;

  if (req.user?.role !== 'user') {
    return res.status(403).json({ error: '僅限會員操作' });
  }

  if (!userId) {
    console.error('req.user 無效:', req.user);
    return res.status(401).json({ error: '尚未登入或 token 無效' });
  }

  try {
    const orders = await findOrders({ userId, filters });
    res.json(orders);
  } catch (err) {
    console.error('取得會員訂單失敗:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAdminOrders,
  createOrder,
  getOrderById,
  updateOrder,
  softDeleteOrder,
  getAllOrders,
  getUserOrders,
};
