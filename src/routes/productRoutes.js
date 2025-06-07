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

router.get('/admin', isAdmin, getAllProducts);
router.get('/admin/:id', isAdmin, getProductById);
router.post('/admin', isAdmin, validate(productSchema), createProduct);
router.put('/admin/:id', isAdmin, validate(productSchema), updateProduct);
router.delete('/admin/:id', isAdmin, deleteProduct);

router.get('/', getAllProducts);
router.get('/:id', getProductById);

module.exports = router;