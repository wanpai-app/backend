require('express');
const db = require('../configs/db');
const { ordersTable } = require('../models/orderSchema');
const { eq } = require('drizzle-orm');

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
};

const updateOrder = async (req, res) => {
  const id = Number(req.params.id);
  const { recipientName, recipientPhone, shippingAddress, status } = req.body;
  if (!recipientName || !recipientPhone || !shippingAddress || !status) {
    return res.status(400).json({ error: '缺少必要欄位' });
  }
  try {
    const [insertedOrder] = await db
      .update(ordersTable)
      .set({
        recipientName,
        recipientPhone,
        shippingAddress,
        status,
        updatedAt: new Date(),
      })
      .where(eq(ordersTable.id, id))
      .returning();
    res.status(201).json(insertedOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const softDeleteOrder = async (req, res) => {
  const id = Number(req.params.id);
  try {
    await db.update(ordersTable).set({ isDeleted: true }).where(eq(ordersTable.id, id));
    res.json({ message: '訂單已軟刪除' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getOrderById, updateOrder, softDeleteOrder };
