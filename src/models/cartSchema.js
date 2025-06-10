const {
  pgTable,
  serial,
  integer,
  numeric,
  timestamp,
  boolean,
  check,
} = require('drizzle-orm/pg-core');
const { sql } = require('drizzle-orm');
const { productsTable } = require('./productSchema');
const { usersTable } = require('./userSchema');

const cartItemsTable = pgTable(
  'cart_items',
  {
    id: serial('id').primaryKey(),
    productId: integer('product_id')
      .notNull()
      .references(() => productsTable.id),
    userId: integer('user_id')
      .notNull()
      .references(() => usersTable.id),
    quantity: integer('quantity').notNull(),
    priceAtAdd: numeric('price_at_add', { precision: 8 }).notNull(),
    addedAt: timestamp('added_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    softDel: boolean('soft_del').default(false).notNull(),
  },
  (table) => [
    check('quantity_check', sql`${table.quantity} > 0`),
    check('unit_price_check', sql`${table.unitPrice} >= 0`),
  ]
);

module.exports = { cartItemsTable };
