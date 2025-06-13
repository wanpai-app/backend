const { pgTable, serial, integer } = require('drizzle-orm/pg-core');

const { tagsTable } = require('./tagSchema');
const { productsTable } = require('./productsSchema');

const productTagSTable = pgTable('product_tags', {
  id: serial('id').primaryKey(),
  tagId: integer('tag_id').references(() => tagsTable.id),
  productId: integer('product_id').references(() => productsTable.id),
});

module.exports = { productTagSTable };
