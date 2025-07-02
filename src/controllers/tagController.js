const { eq, and } = require('drizzle-orm');
const { tagsTable, typeEnum } = require('../models/tagSchema');
const { productsTable } = require('../models/productSchema');
const { productTagSTable } = require('../models/productTagSchema');
const { productImagesTable } = require('../models/productImageSchema');
const db = require('../configs/db');

const tagsController = {
  getAllFilterTags: async (req, res) => {
    try {
      const brands = await db
        .select({
          id: tagsTable.id,
          tagname: tagsTable.tagname,
        })
        .from(tagsTable)
        .where(eq(tagsTable.type, typeEnum.enumValues[1]));

      const series = await db
        .select({
          id: tagsTable.id,
          tagname: tagsTable.tagname,
        })
        .from(tagsTable)
        .where(eq(tagsTable.type, typeEnum.enumValues[2]));

      const ip = await db
        .select({
          id: tagsTable.id,
          tagname: tagsTable.tagname,
        })
        .from(tagsTable)
        .where(eq(tagsTable.type, typeEnum.enumValues[0]));

      res.status(200).json({ brands, series, ip });
    } catch {
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  getProductsByTagnames: async (req, res) => {
    const { tagname } = req.query;

    try {
      if (!tagname) {
        return res.json({ products: [] });
      }

      const products = await db
        .select({
          id: productsTable.id,
          name: productsTable.name,
          sku: productsTable.sku,
          description: productsTable.description,
          price: productsTable.price,
          status: productsTable.status,
          stockOnHand: productsTable.stockOnHand,
          stockReserved: productsTable.stockReserved,
          createdAt: productsTable.createdAt,
          updatedAt: productsTable.updatedAt,
          coverImage: productImagesTable.imgUrl,
        })
        .from(productsTable)
        .innerJoin(productTagSTable, eq(productsTable.id, productTagSTable.productId))
        .innerJoin(tagsTable, eq(productTagSTable.tagId, tagsTable.id))
        .leftJoin(
          productImagesTable,
          and(
            eq(productsTable.id, productImagesTable.productId),
            eq(productImagesTable.isCover, true)
          )
        )
        .where(
          and(
            eq(tagsTable.tagname, tagname),
            eq(productsTable.status, 'active'),
            eq(productsTable.isDeleted, false)
          )
        );

      res.json({ products });
    } catch {
      res.status(500).json({ message: 'Internal server error' });
    }
  },
};

module.exports = tagsController;
