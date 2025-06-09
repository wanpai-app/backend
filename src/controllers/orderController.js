require('express');
const db = require('../configs/db');
const { ordersTable } = require('../models/orderSchema');
const { eq } = require('drizzle-orm');

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
    res.status(201).json(insertedOrder);
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

module.exports = { createOrder, getOrderById, updateOrder, softDeleteOrder };
