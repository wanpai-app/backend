const { pgTable, serial, varchar } = require('drizzle-orm/pg-core');

const { withTimestamps } = require('./core/helpers');

const usersTable = pgTable(
  'users',
  withTimestamps({
    id: serial('id').primaryKey(),
    username: varchar('username', { length: 50 }).notNull(),
    email: varchar('email', { length: 100 }).notNull().unique(),
    password: varchar('password', { length: 255 }).notNull(),
    role: varchar("role", { length: 10 }).default("user"),
  })
);

module.exports = { usersTable };
