const express = require('express');
const router = express.Router();
const { login } = require('../controllers/userController');
const { orderSchema } = require('../validators/orderValidator');
const {
  getUserOrders,
  getOrderById,
  getAdminOrders,
  createOrder,
  updateOrder,
  softDeleteOrder,
} = require('../controllers/orderController');

const authenticateToken = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const validate = require('../middleware/validate');

router.post('/auth/login', login);

router.get('/', authenticateToken, getUserOrders);
router.get('/:id', authenticateToken, getOrderById);

// for admin
router.get('/admin/orders', authenticateToken, isAdmin, getAdminOrders);
router.get('/admin/orders/:id', authenticateToken, isAdmin, getOrderById);
router.put('/admin/orders/:id', authenticateToken, isAdmin, updateOrder);
router.post('/admin/orders', authenticateToken, validate(orderSchema), isAdmin, createOrder);
router.delete('/admin/orders/:id', authenticateToken, isAdmin, softDeleteOrder);

module.exports = router;
