const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

// for users
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// for admin (之後可加 middleware 驗證 isAdmin)
router.get('/admin', getAllProducts);
router.get('/admin/:id', getProductById);
router.post('/admin', createProduct);
router.put('/admin/:id', updateProduct);
router.delete('/admin/:id', deleteProduct);

module.exports = router;