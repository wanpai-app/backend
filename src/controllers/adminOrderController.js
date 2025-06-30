const db = require('../configs/db');
const { ordersTable } = require('../models/orderSchema');
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

const updateOrder = async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: '無效的ID' });

  try {
    const [currentOrder] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));

    if (!currentOrder) {
      return res.status(404).json({ error: '找不到該訂單' });
    }

    const updateData = { ...req.body, updatedAt: new Date() };

    if (req.body.status === 'shipped' && currentOrder.status !== 'shipped') {
      updateData.shippedAt = new Date();
    }
    if (req.body.status === 'delivered' && currentOrder.status !== 'delivered') {
      updateData.deliveredAt = new Date();
    }

    const [insertedOrder] = await db
      .update(ordersTable)
      .set(updateData)
      .where(eq(ordersTable.id, id))
      .returning();
    res.status(200).json(insertedOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAdminOrders,
  softDeleteOrder,
  updateOrder,
};
