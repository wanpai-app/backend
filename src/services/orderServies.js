const { db } = require('../drizzle');
const { ordersTable } = require('../models/orderSchema');
const { eq, and, gte, lte } = require('drizzle-orm');

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
  findOrders,
};
