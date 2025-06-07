const {
  pgTable,
  serial,
  varchar,
  integer,
  text,
  boolean,
  unique,
} = require("drizzle-orm/pg-core");

const { productsTable } = require("./productSchema");
const { withTimestamps } = require("./core/helpers");

const productImagesTable = pgTable(
  "product_images",
  {
    id: serial("id").primaryKey(),
    refId: varchar("ref_id", { length: 20 }).references(() => productsTable.refId),
    productId: integer("product_id").references(() => productsTable.id),
    imgUrl: text("img_url").notNull(),
    orderIndex: integer("order_index"),
    isCover: boolean("is_cover").default(false),
    ...withTimestamps(),
  },
  {
    uniqueConstraints: [
      unique("unique_ref_img").on("refId", "imgUrl"),
    ],
  }
);

module.exports = { productImagesTable };