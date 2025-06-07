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
  orderId: integer('order_id'),
  read: boolean('read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

module.exports = { notificationsTable, notificationTypeEnum };
