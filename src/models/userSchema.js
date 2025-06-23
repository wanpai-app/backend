const { pgTable, serial, varchar, timestamp, pgEnum } = require('drizzle-orm/pg-core');
const roleEnum = pgEnum('role', ['admin', 'user']);
const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: roleEnum('role').default('user'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  phone: varchar('phone', { length: 10 }),
  address: varchar('address', { length: 255 }),
  googleId: varchar('google_id', { length: 255 }),
  provider: varchar('provider', { length: 50 }).default('local'),
});

module.exports = { usersTable, roleEnum };
