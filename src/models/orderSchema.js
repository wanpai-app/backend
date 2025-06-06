const { pgTable, pgEnum, serial, varchar, integer, timestamp } = require('drizzle-orm/pg-core');
const { usersTable } = require('./userSchema');

const orderStatusEnum = pgEnum('order_status', [
  'paid',
  'cancelled',
  'refunded',
  'shipped',
  'delivered',
  'returned',
]);

const ordersTable = pgTable('orders', {
  id: serial('id').primaryKey().notNull(),
  orderNumber: varchar('order_number', { length: 255 }).notNull(),
  userId: integer('user_id').references(() => usersTable.id),
  recepientName: varchar('recepient_name', { length: 100 }).notNull(),
  recepientPhone: varchar('recepient_phone', { length: 20 }).notNull(),
  shippingAdress: varchar('shipping_address', { length: 255 }).notNull(),
  totalPrice: integer('total_price').notNull(),
  quantity: integer('quantity').notNull(),
  status: orderStatusEnum('status').default('paid').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

module.exports = { ordersTable, orderStatusEnum };
