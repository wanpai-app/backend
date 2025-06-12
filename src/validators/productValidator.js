const { z } = require('zod');

const statusValues = ['draft', 'active', 'archived'];

const productSchema = z.object({
  refId: z.string().min(1).optional(),
  name: z.string().min(1),
  sku: z.string().min(1),
  description: z.string().min(1),
  price: z.number().min(0),
  status: z.enum(statusValues),
  stockOnHand: z.number().min(0),
  stockReserved: z.number().min(0).default(0),
  isDeleted: z.boolean().default(false),
});

module.exports = { productSchema };
