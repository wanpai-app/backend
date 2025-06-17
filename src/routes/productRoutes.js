const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const authenticateToken = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const validate = require('../middleware/validate');
const { productSchema } = require('../validators/productValidator');

router.get('/admin/products', authenticateToken, isAdmin, getAllProducts);
router.get('/admin/products/:id', authenticateToken, isAdmin, getProductById);
router.post('/admin/products', authenticateToken, isAdmin, validate(productSchema), createProduct);
router.put(
  '/admin/products/:id',
  authenticateToken,
  isAdmin,
  validate(productSchema),
  updateProduct
);
router.delete('/admin/products/:id', authenticateToken, isAdmin, deleteProduct);

router.get('/products', getAllProducts);
router.get('/products/:id', getProductById);
module.exports = router;
