const db = require('../configs/db');
const { ordersTable } = require('../models/orderSchema');
const { eq } = require('drizzle-orm');
const { findOrders } = require('../services/orderService');
const { getOrderWithItems } = require('../services/orderService');

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
    res.status(500).json({ error: err.message });
  }
};

const getOrderById = async (req, res) => {
  const id = Number(req.params.id);
  const userId = req.user?.id;
  const isAdmin = req.user?.role === 'admin';

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
    res.status(500).json({ error: err.message });
  }
  try {
    const filters = req.query;
    const ordersList = await findOrders({ filters });
    res.json(ordersList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateOrder = async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: '無效的ID' });

  try {
    const [insertedOrder] = await db
      .update(ordersTable)
      .set({
        ...req.body,
        updatedAt: new Date(),
      })
      .where(eq(ordersTable.id, id))
      .returning();
    res.status(200).json(insertedOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const softDeleteOrder = async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: '無效的ID' });

  try {
    const [deleted] = await db
      .update(ordersTable)
      .set({ isDeleted: true })
      .where(eq(ordersTable.id, id))
      .returning();
    res.status(201).json([deleted]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const filters = req.query;
    const orders = await findOrders({ filters });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUserOrders = async (req, res) => {
  if (!req.user || !req.user.id) {
    console.error(' 沒有抓到 req.user 或 user.id！現在是：', req.user);
    return res.status(401).json({ error: '尚未登入或 token 無效' });
  }

  const userId = req.user.id;

  try {
    const orders = await findOrders({ userId });
    res.json(orders);
  } catch (error) {
    console.error(' 取得訂單失敗:', error);
    res.status(500).json({ error: '無法取得訂單' });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  updateOrder,
  softDeleteOrder,
  getAllOrders,
  getUserOrders,
};
