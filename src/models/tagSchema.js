const { pgTable, serial, varchar, pgEnum } = require('drizzle-orm/pg-core');

const typeEnum = pgEnum('type', ['ip', 'brand', 'series']);

const tagsTable = pgTable('tags', {
  id: serial('id').primaryKey(),
  tagname: varchar('tagname', { length: 225 }).notNull(),
  type: typeEnum('type'),
});

module.exports = { tagsTable, typeEnum };
