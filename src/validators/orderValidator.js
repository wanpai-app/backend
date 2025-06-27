const { z } = require('zod');

const statusValues = [
  'pending',
  'paid',
  'cancelled',
  'refunded',
  'shipped',
  'delivered',
  'returned',
];

const orderItemSchema = z.object({
  productId: z.number().min(1),
  productName: z.string().min(1),
  productImage: z.string().optional().default('no-image.png'),
  quantity: z.number().min(1),
  price: z.number().min(0),
  subtotal: z.number().min(0),
});

const orderSchema = z.object({
  orderNumber: z.string().min(1),
  userId: z.number().min(1),
  recipientName: z.string().min(1),
  recipientPhone: z.string().regex(/^09\d{8}$/, '手機號碼格式錯誤'),
  shippingAddress: z.string().min(1),
  totalPrice: z.number().min(0),
  quantity: z.number().min(1),
  status: z.enum(statusValues).optional().default('pending'),
  items: z.array(orderItemSchema).optional(),
});

module.exports = { orderSchema };
