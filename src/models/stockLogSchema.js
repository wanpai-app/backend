const { pgTable, pgEnum, serial, integer, varchar, timestamp } = require('drizzle-orm/pg-core');
const { productsTable } = require('./productSchema');
const { usersTable } = require('./userSchema');
const stockReasonEnum = pgEnum('stock_reason', [
  'stock_in',
  'stock_out',
  'adjustment',
  'initial',
  'return',
  'correction',
]);

const stockLogsTable = pgTable('stock_logs', {
  id: serial('id').primaryKey(),
  productId: integer('product_id')
    .notNull()
    .references(() => productsTable.id),
  amountAfter: integer('amount_after').notNull(),
  amountChange: integer('amount_change').notNull(),
  reason: stockReasonEnum('reason').default('adjustment'),
  email: varchar('email')
    .notNull()
    .references(() => usersTable.email),
  createdAt: timestamp('created_at').defaultNow(),
});

module.exports = {
  stockLogsTable,
  stockReasonEnum,
};
