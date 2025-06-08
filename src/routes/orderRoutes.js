const express = require('express');
const router = express.Router();

const {
  createOrder,
  updateOrder,
  softDeleteOrder,
  getOrderById,
} = require('../controllers/orderController');

const isAdmin = require('../middleware/isAdmin');
const validate = require('../middleware/validate');

const { orderSchema } = require('../validators/orderValidator');
// for users
router.get('/orders/:id', getOrderById);

// for admin
router.get('/admin/orders/:id', getOrderById);
router.put('/admin/orders/:id', updateOrder);
router.post('/admin/orders', isAdmin, validate(orderSchema), createOrder);
router.delete('/admin/orders/:id', softDeleteOrder);

module.exports = router;
