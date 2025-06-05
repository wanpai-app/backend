const {
  pgTable,
  pgEnum,
  serial,
  varchar,
  integer,
  text,
  check,
} = require('drizzle-orm/pg-core');
const { sql } = require('drizzle-orm');
const { withTimestamps } = require("./core/helpers");

const statusEnum = pgEnum('status', ['draft', 'active', 'archived']);

const productsTable = pgTable(
  "products",
  withTimestamps({
    id: serial("id").primaryKey().notNull(),
    refId: varchar("ref_id", { length: 20 }).unique(),
    name: varchar("name", { length: 225 }).notNull(),
    sku: varchar("sku", { length: 255 }).notNull().unique(),
    description: text("description").notNull(),
    price: integer("price").notNull(),
    status: statusEnum("status").notNull().default("draft"),
    stockOnHand: integer("stock_on_hand").default(0),
    stockReserved: integer("stock_reserved").default(0),
  }),
  (table) => [check("price_check", sql`${table.price} >= 0`)]
);

module.exports = { productsTable };