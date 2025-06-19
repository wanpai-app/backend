const {
  pgTable,
  pgEnum,
  serial,
  varchar,
  integer,
  timestamp,
  boolean,
} = require('drizzle-orm/pg-core');
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
  id: serial('id').primaryKey(),
  orderNumber: varchar('order_number', { length: 255 }).notNull(),
  userId: integer('user_id').references(() => usersTable.id),
  recipientName: varchar('recipient_name', { length: 100 }).notNull(),
  recipientPhone: varchar('recipient_phone', { length: 20 }).notNull(),
  shippingAddress: varchar('shipping_address', { length: 255 }).notNull(),
  totalPrice: integer('total_price').notNull(),
  quantity: integer('quantity').notNull(),
  status: orderStatusEnum('status').default('paid').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  isDeleted: boolean('is_deleted').default(false),
});

module.exports = { ordersTable, orderStatusEnum };
