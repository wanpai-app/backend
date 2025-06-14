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

  productName: text('product_name').notNull().comment('商品名稱（下單當下）'),

  productImage: text('product_image')
    .default('no-image.png')
    .notNull()
    .comment('商品主圖（下單當下）'),

  quantity: integer('quantity').notNull().comment('購買數量'),

  price: numeric('price', { precision: 10, scale: 2 }).notNull().comment('商品單價（下單時）'),

  subtotal: numeric('subtotal', { precision: 10, scale: 2 })
    .notNull()
    .comment('總金額 (price * quantity)'),
});

module.exports = { orderItemsTable };
