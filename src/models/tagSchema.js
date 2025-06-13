const { pgTable, serial, varchar } = require('drizzle-orm/pg-core');

const tagsTable = pgTable('tagsTable', {
  id: serial('id').primaryKey(),
  ip: varchar('ip', { length: 225 }),
  brand: varchar('brand', { length: 225 }),
  series: varchar('series', { length: 225 }),
});
module.exports = { tagsTable };
