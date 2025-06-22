const db = require('../configs/db');
const { ordersTable } = require('../models/orderSchema');
const { eq, and, gte, lte } = require('drizzle-orm');
const { orderItemsTable } = require('../models/orderItemSchema');

const getOrderWithItems = async (orderId) => {
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));

  if (!order) return null;

  const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, orderId));

  return {
    ...order,
    items,
    receiver: {
      name: order.receiverName,
      phone: order.receiverPhone,
      address: order.shippingAddress,
      branch: order.pickupBranch,
      pickupDeadline: order.pickupDeadline,
    },
  };
};

const findOrders = async ({ userId, filters = {} }) => {
  let query = db.select().from(ordersTable).where(eq(ordersTable.isDeleted, false));

  if (userId) {
    query = query.where(eq(ordersTable.userId, userId));
  }

  if (filters.status) {
    query = query.where(eq(ordersTable.status, filters.status));
  }
  if (filters.startDate && filters.endDate) {
    query = query.where(
      and(
        gte(ordersTable.createdAt, new Date(filters.startDate)),
        lte(ordersTable.createdAt, new Date(filters.endDate))
      )
    );
  }
  return await query;
};

module.exports = {
  getOrderWithItems,
  findOrders,
};
