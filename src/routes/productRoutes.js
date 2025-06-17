const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { deleteProductImage } = require('../controllers/productImageController');
// const { upload, uploadImages } = require('../middlewares/s3Upload');

const authenticateToken = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const validate = require('../middleware/validate');
const { productSchema } = require('../validators/productValidator');

router.get('/admin/products', isAdmin, getAllProducts);
router.get('/admin/products/:id', isAdmin, getProductById);
router.post(
  '/admin/products',
  authenticateToken,
  isAdmin,
  // uploadImages,
  validate(productSchema),
  createProduct
);
router.put(
  '/admin/products/:id',
  authenticateToken,
  isAdmin,
  validate(productSchema),
  updateProduct
);
router.delete(
  '/admin/products/:id',
  authenticateToken,
  isAdmin,
  deleteProduct
);

router.delete(
  '/admin/productimage/:id',
  authenticateToken,
  isAdmin,
  deleteProductImage
);

router.get('/products', getAllProducts);
router.get('/products/:id', getProductById);
module.exports = router;
