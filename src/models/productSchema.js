const { pgTable, serial, varchar, integer, text, timestamp, sql } = require('drizzle-orm/pg-core');

const productsTable = pgTable('products', {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 225 }).notNull(),
  sku: varchar({ length: 255 }).notNull().unique(),
  description: text().notNull(),
  price: integer()
    .notNull()
    .check(sql`price >= 0`),
  status: varchar().notNull().default('draft'),
  stockOnHand: integer('stock_on_hand').default(0),
  stockReserved: integer('stock_reserved').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

module.exports = { productsTable };
