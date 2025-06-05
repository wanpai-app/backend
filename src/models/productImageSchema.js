const {
  pgTable,
  serial,
  varchar,
  integer,
  text,
  boolean
} = require("drizzle-orm/pg-core");

const { productsTable } = require("./productSchema");
const { withTimestamps } = require("./core/helpers");
const { fkTo } = require("./core/constraints");
const { productImagesConstraints } = require("./productImagesConstraints");

const productImagesTable = pgTable(
  "product_images",
  withTimestamps({
    id: serial("id").primaryKey(),
    refId: varchar("ref_id", { length: 20 }).references(() => productsTable.refId),
    productId: fkTo(productsTable, { onDelete: "set null" })(integer("product_id")),
    imgUrl: text("img_url").notNull(),
    orderIndex: integer("order_index"),
    isCover: boolean("is_cover").default(false),
  }),
  productImagesConstraints
);

module.exports = { productImagesTable };