const { z } = require('zod');

const createProductImageSchema = z.object({
  refId: z.string().min(1).optional(),
  productId: z.number().int(),
  imgUrl: z.string().url(),
  orderIndex: z.number().int().optional(),
  isCover: z.boolean().optional(),
});

const updateProductImageSchema = z.object({
  refId: z.string().min(1).optional(),
  productId: z.number().int().optional(),
  imgUrl: z.string().url().optional(),
  orderIndex: z.number().int().optional(),
  isCover: z.boolean().optional(),
});

module.exports = {
  createProductImageSchema,
  updateProductImageSchema,
};
