const db = require('../configs/db');
const { eq, and, gte, lte, ilike } = require('drizzle-orm');
const { ordersTable } = require('../models/orderSchema');
const { orderItemsTable } = require('../models/orderItemSchema');
const { productImagesTable } = require('../models/productImageSchema');

const getOrderWithItems = async (orderId) => {
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));

  if (!order) return null;

  const items = await db
    .select({
      productId: orderItemsTable.productId,
      productName: orderItemsTable.productName,
      quantity: orderItemsTable.quantity,
      price: orderItemsTable.price,
      subtotal: orderItemsTable.subtotal,
      productImage: productImagesTable.imgUrl,
    })
    .from(orderItemsTable)
    .leftJoin(
      productImagesTable,
      and(
        eq(orderItemsTable.productId, productImagesTable.productId),
        eq(productImagesTable.isCover, true)
      )
    )
    .where(eq(orderItemsTable.orderId, orderId));

  const total = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);

  return {
    ...order,
    items,
    totalPrice: total,
    receiver: {
      name: order.recipientName,
      phone: order.recipientPhone,
      address: order.shippingAddress,
      branch: order.pickupBranch,
      pickupDeadline: order.pickupDeadline,
    },
  };
};

const isValidDate = (date) => !isNaN(new Date(date).getTime());

const findOrders = async ({ userId, filters = {} }) => {
  const conditions = [eq(ordersTable.isDeleted, false)];

  if (userId) {
    conditions.push(eq(ordersTable.userId, userId));
  }

  if (filters.status) {
    conditions.push(eq(ordersTable.status, filters.status));
  }

  if (isValidDate(filters.startDate) && isValidDate(filters.endDate)) {
    conditions.push(
      gte(ordersTable.createdAt, new Date(filters.startDate)),
      lte(ordersTable.createdAt, new Date(filters.endDate))
    );
  }

  if (filters.search) {
    conditions.push(ilike(ordersTable.orderNumber, `%${filters.search}%`));
  }

  const orders = await db
    .select()
    .from(ordersTable)
    .where(and(...conditions));

  for (const order of orders) {
    const items = await db
      .select({
        productId: orderItemsTable.productId,
        productName: orderItemsTable.productName,
        quantity: orderItemsTable.quantity,
        price: orderItemsTable.price,
        productImage: productImagesTable.imgUrl,
      })
      .from(orderItemsTable)
      .leftJoin(
        productImagesTable,
        and(
          eq(orderItemsTable.productId, productImagesTable.productId),
          eq(productImagesTable.isCover, true)
        )
      )
      .where(eq(orderItemsTable.orderId, order.id));

    order.items = items;
  }

  return orders;
};

module.exports = {
  getOrderWithItems,
  findOrders,
};
