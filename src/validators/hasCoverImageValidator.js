const { productImagesTable } = require('../models/productImageSchema');
const db = require('../configs/db');
const { eq } = require('drizzle-orm');

const validateHasCoverImage = async (req, res, next) => {
    try {
      const productId = Number(req.params.id || req.body.id);
      const status = req.body.status;

      if (status === 'draft') {
        return next();
      }

      if (!productId || isNaN(productId)) {
        return res.status(400).json({ error: '無效的商品 ID' });
      }

      const images = await db
        .select()
        .from(productImagesTable)
        .where(eq(productImagesTable.productId, productId));

      const hasCover = images.some((img) => img.isCover === true);

      if (!hasCover) {
        return res.status(400).json({ error: '缺少封面圖，請上傳後再送出' });
      }

      next();
    } catch (err) {
      console.error('封面圖驗證失敗:', err);
      return res.status(500).json({ error: '封面圖驗證時發生錯誤' });
    }
  };

module.exports = { validateHasCoverImage };
