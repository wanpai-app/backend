const { findOrders, getOrderWithItems } = require('../services/orderService');
const db = require('../configs/db');
const { ordersTable } = require('../models/orderSchema');

const createOrder = async (req, res) => {
  try {
    const {
      userId,
      orderNumber,
      recipientName,
      recipientPhone,
      shippingAddress,
      totalPrice,
      quantity,
    } = req.body;

    if (
      !userId ||
      !orderNumber ||
      !recipientName ||
      !recipientPhone ||
      !shippingAddress ||
      !totalPrice ||
      !quantity
    ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [insertedOrder] = await db
      .insert(ordersTable)
      .values({
        userId,
        orderNumber,
        recipientName,
        recipientPhone,
        shippingAddress,
        totalPrice,
        quantity,
      })
      .returning();

    res.status(201).json(insertedOrder);
  } catch (err) {
    console.error('[createOrder] error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getUserOrders = async (req, res) => {
  const userId = req.user?.id;
  const filters = req.query;

  if (req.user?.role !== 'user') {
    return res.status(403).json({ error: '僅限會員操作' });
  }

  if (!userId) {
    return res.status(401).json({ error: '尚未登入或 token 無效' });
  }

  try {
    const cleanFilters = {};
    if (filters.search && typeof filters.search === 'string' && filters.search.trim() !== '') {
      cleanFilters.search = filters.search;
    }

    if (
      filters.orderNumber &&
      typeof filters.orderNumber === 'string' &&
      filters.orderNumber.trim() !== ''
    ) {
      cleanFilters.orderNumber = filters.orderNumber;
    }

    if (
      typeof filters.startDate === 'string' &&
      filters.startDate.trim() !== '' &&
      !isNaN(new Date(filters.startDate))
    ) {
      cleanFilters.startDate = filters.startDate;
    }

    if (
      typeof filters.endDate === 'string' &&
      filters.endDate.trim() !== '' &&
      !isNaN(new Date(filters.endDate))
    ) {
      cleanFilters.endDate = filters.endDate;
    }

    const orders = await findOrders({ userId, filters: cleanFilters });

    res.json(orders);
  } catch (err) {
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
    res.status(500).json({ error: err.message });
  }
};

const applyReturn = async (req, res) => {
  const userId = req.user?.id;
  const orderId = Number(req.params.id);
  const { reason, description } = req.body;

  if (isNaN(orderId)) {
    return res.status(400).json({ error: '訂單 ID 無效' });
  }

  if (!reason || !description) {
    return res.status(400).json({ error: '請提供退貨原因和描述' });
  }

  try {
    const order = await getOrderWithItems(orderId);
    if (!order) {
      return res.status(404).json({ message: '找不到該訂單' });
    }

    if (order.userId !== userId) {
      return res.status(403).json({ error: '無權操作此訂單' });
    }

    if (!['delivered', 'shipped'].includes(order.status)) {
      return res.status(400).json({ error: '此訂單狀態無法申請退貨' });
    }

    const { ordersTable } = require('../models/orderSchema');
    const { eq } = require('drizzle-orm');
    const db = require('../configs/db');

    const [updatedOrder] = await db
      .update(ordersTable)
      .set({
        status: 'returned',
      })
      .where(eq(ordersTable.id, orderId))
      .returning();

    res.json({
      message: '退貨申請已提交',
      order: updatedOrder,
      returnInfo: { reason, description },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  applyReturn,
};
