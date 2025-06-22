const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

const {
  getUserOrders,
  getOrderById,
  updateOrder,
  softDeleteOrder,
  getAllOrders,
} = require('../controllers/orderController');

const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: '無權限操作' });
  }
  next();
};

const isUser = (req, res, next) => {
  if (req.user?.role !== 'user') {
    return res.status(403).json({ error: '僅限會員操作' });
  }
  next();
};

router.get('/', authenticateToken, isUser, getUserOrders);
router.get('/:id', authenticateToken, isUser, getOrderById);

router.get('/admin/orders', authenticateToken, isAdmin, getAllOrders);
router.get('/admin/orders/:id', authenticateToken, isAdmin, getOrderById);
router.put('/admin/orders/:id', authenticateToken, isAdmin, updateOrder);
router.delete('/admin/orders/:id', authenticateToken, isAdmin, softDeleteOrder);

module.exports = router;
