const { pgTable, serial, varchar, timestamp } = require("drizzle-orm/pg-core");

const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

const db = require("../configs/db");

async function getProductById(id) {
  const result = await db.query("SELECT * FROM products WHERE id = $1", [id]);
  return result.rows[0];
}

module.exports = { users };
