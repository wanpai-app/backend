const db = require('../configs/db');
const { ordersTable } = require('../models/orderSchema');
const { orderItemsTable } = require('../models/orderItemSchema');
const { like, eq, and, gte, lte } = require('drizzle-orm');

const getOrderWithItems = async (orderId) => {
  if (isNaN(orderId)) {
    throw new Error('傳入的 orderId 無效');
  }

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));

  if (!order) return null;

  const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, orderId));

  return {
    ...order,
    items,
    receiver: {
      name: order.recipientName,
      phone: order.recipientPhone,
      address: order.shippingAddress,
    },
  };
};

const findOrders = async ({ userId, filters = {} }) => {
  const conditions = [eq(ordersTable.isDeleted, false)];
  const { orderNumber, dateRange } = filters;

  if (orderNumber && typeof orderNumber === 'string') {
    conditions.push(like(ordersTable.orderNumber, `%${orderNumber.trim()}%`));
  }

  if (typeof userId !== 'undefined') {
    conditions.push(eq(ordersTable.userId, userId));
  }

  if (dateRange && !isNaN(Number(dateRange))) {
    const days = Number(dateRange);
    const today = new Date();
    const past = new Date();
    past.setDate(today.getDate() - days);

    conditions.push(and(gte(ordersTable.createdAt, past), lte(ordersTable.createdAt, today)));
  }

  try {
    const result = await db
      .select()
      .from(ordersTable)
      .where(and(...conditions));

    return result;
  } catch (err) {
    console.error('findOrders 查詢失敗:', err);
    throw err;
  }
};

module.exports = {
  getOrderWithItems,
  findOrders,
};
