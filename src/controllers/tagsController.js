const { eq, inArray, and } = require('drizzle-orm');
const { tagsTable, typeEnum } = require('../models/tagsSchema');
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
    } catch (error) {
      console.error('Error fetching filter tags:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  getProductsByTagnames: async (req, res) => {
    const { tagname } = req.query;

    try {
      if (!tagname) {
        return res.json({ products: [] });
      }

      const tags = await db
        .select({ id: tagsTable.id })
        .from(tagsTable)
        .where(eq(tagsTable.tagname, tagname));
      if (tags.length === 0) {
        return res.json({ products: [] });
      }
      const tagId = tags[0].id;

      const productTagLinks = await db
        .select({ productId: productTagSTable.productId })
        .from(productTagSTable)
        .where(eq(productTagSTable.tagId, tagId));
      if (productTagLinks.length === 0) {
        return res.json({ products: [] });
      }
      const productIds = productTagLinks.map((p) => p.productId);

      const products = await db
        .select()
        .from(productsTable)
        .where(and(inArray(productsTable.id, productIds), eq(productsTable.status, 'active')));
      if (products.length === 0) {
        return res.json({ products: [] });
      }

      const activeProductIds = products.map((p) => p.id);
      const coverImages = await db
        .select({ productId: productImagesTable.productId, imgUrl: productImagesTable.imgUrl })
        .from(productImagesTable)
        .where(
          and(
            inArray(productImagesTable.productId, activeProductIds),
            eq(productImagesTable.isCover, true)
          )
        );
      const coverMap = new Map(coverImages.map((img) => [img.productId, img.imgUrl]));

      const productsWithCovers = products.map((p) => ({
        ...p,
        coverImage: coverMap.get(p.id) || null,
      }));

      res.json({ products: productsWithCovers });
    } catch (error) {
      console.error('[API FATAL ERROR] in getProductsByTagnames:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
};

module.exports = tagsController;
