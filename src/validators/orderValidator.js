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

const orderSchema = z.object({
  orderNumber: z.string().min(1),
  userId: z.number().min(1),
  recipientName: z.string().min(1),
  recipientPhone: z.string().min(1),
  shippingAddress: z.string().min(1),
  totalPrice: z.number().min(0),
  quantity: z.number().min(0),
  status: z.enum(statusValues),
});

module.exports = { orderSchema };
