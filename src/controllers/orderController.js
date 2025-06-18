const db = require('../configs/db');
const { ordersTable } = require('../models/orderSchema');
const { eq } = require('drizzle-orm');
const { findOrders } = require('../services/orderService');

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
  try {
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));

    if (!order) {
      return res.status(404).json({ message: '找不到該訂單' });
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
  const userId = req.user.id;
  try {
    const orders = await findOrders({ userId });
    res.json(orders);
  } catch (error) {
    console.error('取得訂單錯誤：', error);
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
