const { pgTable, pgEnum, serial, integer, varchar, timestamp } = require('drizzle-orm/pg-core');
const { productsTable } = require('./productSchema');

const stockReasonEnum = pgEnum('stock_reason', [
  'stock_in',
  'stock_out',
  'adjustment',
  'initial',
  'return',
]);

const stockLogsTable = pgTable('stock_logs', {
  id: serial('id').primaryKey().notNull(),
  productId: integer('product_id')
    .notNull()
    .references(() => productsTable.id),
  amountBefore: integer('amount_before').notNull(),
  amountAfter: integer('amount_after').notNull(),
  amountChange: integer('amount_change').notNull(),
  reason: stockReasonEnum('reason').default('adjustment'),
  role: varchar('role', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
});

module.exports = {
  stockLogsTable,
};
