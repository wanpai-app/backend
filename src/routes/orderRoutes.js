const express = require('express');
const router = express.Router();
const { updateOrder, softDeleteOrder } = require('../controllers/orderController');

// for users
// router.get('/orders', getAllOrders);
// router.get('/orders/:id', getOrderById);

// for admin
// router.get('/admin/orders', getAllOrders);
// router.get('/admin/orders/:id', getOrderById);
router.put('/admin/orders/:id', updateOrder);
router.delete('/admin/orders/:id', softDeleteOrder);

module.exports = router;
