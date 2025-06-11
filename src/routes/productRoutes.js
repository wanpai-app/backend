const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

const isAdmin = require('../middleware/isAdmin');
const validate = require('../middleware/validate');
const { productSchema } = require('../validators/productValidator');

router.get('/admin/products', isAdmin, getAllProducts);
router.get('/admin/products/:id', isAdmin, getProductById);
router.post('/admin/products', isAdmin, validate(productSchema), createProduct);
router.put('/admin/products/:id', isAdmin, validate(productSchema), updateProduct);
router.delete('/admin/products/:id', isAdmin, deleteProduct);

router.get('/products', getAllProducts);
router.get('/products/:id', getProductById);

module.exports = router;
