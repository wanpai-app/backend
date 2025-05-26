const {
  pgTable,
  serial,
  varchar,
  integer,
  text,
  timestamp,
} = require("drizzle-orm/pg-core");

const productsTable = pgTable("products", {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 100 }).notNull(),
  description: text().notNull(),
  img: varchar(),
  price: integer().notNull(),
  status: varchar(),
  currentStock: integer("current_stock"),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

module.exports = { productsTable };
