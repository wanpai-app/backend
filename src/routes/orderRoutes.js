const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

const {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrder,
  softDeleteOrder,
  getAllOrders,
} = require('../controllers/orderController');

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: '無權限' });
  next();
};

const isAuthenticated = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: '請先登入' });
  next();
};

router.get('/orders', authenticateToken, getUserOrders);
router.get('/orders/:id', authenticateToken, getOrderById);
router.get('/admin/orders', authenticateToken, isAdmin, getAllOrders);
router.get('/admin/orders/:id', authenticateToken, getOrderById);
router.put('/admin/orders/:id', authenticateToken, updateOrder);
router.delete('/admin/orders/:id', authenticateToken, softDeleteOrder);

module.exports = router;
