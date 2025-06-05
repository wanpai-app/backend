const { timestamp } = require("drizzle-orm/pg-core");

function withTimestamps(columns) {
  return {
    ...columns,
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  };
}

module.exports = { withTimestamps };