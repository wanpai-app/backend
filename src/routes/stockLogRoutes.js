const express = require('express');
const router = express.Router();
const {
  getAllStockLogs,
  getStockLogsByProduct,
  getStockLogById,
  createStockLog,
} = require('../controllers/stockLogController');

const authenticateToken = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

router.get('/admin/stocklogs', authenticateToken, isAdmin, getAllStockLogs);
router.get('/admin/products/:id/stocklogs', authenticateToken, isAdmin, getStockLogsByProduct);
router.get('/admin/stocklogs/:id', authenticateToken, isAdmin, getStockLogById);
router.post('/admin/products/:id/stocklogs', authenticateToken, isAdmin, createStockLog);

module.exports = router;
