const { pgTable, serial, varchar,pgEnum } = require('drizzle-orm/pg-core');
const { withTimestamps } = require('./core/helpers');
const roleEnum = pgEnum('role', ['admin', 'user']);

const usersTable = pgTable(
  'users',
  withTimestamps({
    id: serial('id').primaryKey(),
    username: varchar('username', { length: 50 }).notNull(),
    email: varchar('email', { length: 100 }).notNull().unique(),
    password: varchar('password', { length: 255 }).notNull(),
    role: roleEnum('role').default('user'),
  })
);

module.exports = { usersTable };
