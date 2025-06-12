const {
  pgTable,
  pgEnum,
  serial,
  varchar,
  integer,
  text,
  check,
  timestamp,
  boolean,
} = require('drizzle-orm/pg-core');
const { sql } = require('drizzle-orm');

const statusEnum = pgEnum('status', ['draft', 'active', 'archived']);

const productsTable = pgTable(
  'products',
  {
    id: serial('id').primaryKey().notNull(),
    refId: varchar('ref_id', { length: 20 }).unique(),
    name: varchar('name', { length: 225 }).notNull(),
    sku: varchar('sku', { length: 255 }).notNull().unique(),
    description: text('description').notNull(),
    price: integer('price').notNull(),
    status: statusEnum('status').notNull().default('draft'),
    stockOnHand: integer('stock_on_hand').default(0),
    stockReserved: integer('stock_reserved').default(0),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
    isDeleted: boolean('is_deleted').default(false),
  },
  (table) => [check('price_check', sql`${table.price} >= 0`)]
);

module.exports = { productsTable, statusEnum };
