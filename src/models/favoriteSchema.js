const {
    pgTable,
    serial,
    integer,
    unique,
  } = require('drizzle-orm/pg-core');
  
  const { usersTable } = require('./userSchema');
  const { productsTable } = require('./productSchema');
  
  const favoritesTable = pgTable(
    'favorites',
    {
      id: serial('id').primaryKey(),
  
      userId: integer('user_id')
        .notNull()
        .references(() => usersTable.id),
  
      productId: integer('product_id')
        .notNull()
        .references(() => productsTable.id),
    },
    (table) => {
      return {
        uniqueFavorite: unique().on(table.userId, table.productId),
      };
    }
  );
  
  module.exports = { favoritesTable };
  
  