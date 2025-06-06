const {
  pgTable,
  serial,
  integer,
  varchar,
  boolean,
  timestamp,
  pgEnum,
} = require('drizzle-orm/pg-core');
const { usersTable } = require('./userSchema');

const notificationTypeEnum = pgEnum('notification_type', [
  'order_created',
  'order_shipped',
  'order_delivered',
  'account',
]);

const notificationsTable = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => usersTable.id)
    .notNull(),
  type: notificationTypeEnum('type').notNull(),
  message: varchar('message', { length: 255 }).notNull(),
  orderId: integer('order_id'), // 若非訂單相關通知，這裡可為 null
  read: boolean('read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

module.exports = { notificationsTable, notificationTypeEnum };
