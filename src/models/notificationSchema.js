const { pgTable, serial, integer, text, boolean, timestamp } = require("drizzle-orm/pg-core");

const notificationsTable = pgTable("notifications", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => usersTable.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  message: text("message").notNull(),
  order_id: text("order_id"),
  read: boolean("read").default(false),
  created_at: timestamp("created_at").defaultNow()
});


const { usersTable } = require("./userSchema");

module.exports = { notificationsTable };
