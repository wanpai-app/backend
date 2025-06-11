const { pgTable, serial, integer, numeric, text } = require('drizzle-orm/pg-core');
const { ordersTable } = require('./orderSchema');
const { productsTable } = require('./productSchema');

const orderItemsTable = pgTable('order_items', {
  id: serial('id').primaryKey(),

  orderId: integer('order_id')
    .references(() => ordersTable.id)
    .notNull(),

  productId: integer('product_id')
    .references(() => productsTable.id)
    .notNull(),

  productName: text('product_name').notNull(),
  productImage: text('product_image').notNull(),

  quantity: integer('quantity').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
});

module.exports = { orderItemsTable };
