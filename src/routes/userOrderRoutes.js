const express = require('express');
const router = express.Router();
const { getUserOrders, getOrderById } = require('../controllers/orderController');
const authenticateToken = require('../middleware/auth');

router.get('/orders', authenticateToken, getUserOrders);
router.get('/orders/:id', authenticateToken, getOrderById);

module.exports = router;
