const express = require('express');
const router = express.Router();

const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProductById,
} = require('../controllers/productController');

const {
  uploadProductImage,
  removeProductImage,
  getProductImagesByProductId,
} = require('../controllers/productImageController');

const { uploadProductImages } = require('../middleware/s3UploadMiddleware');
const authenticateToken = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const validate = require('../middleware/validate');

const { productSchema } = require('../validators/productValidator');
const { validateHasCoverImage } = require('../validators/hasCoverImageValidator');

router.get('/admin/products', authenticateToken, isAdmin, getAllProducts);
router.get('/admin/products/:id', authenticateToken, isAdmin, getProductById);

router.post(
  '/admin/products',
  authenticateToken,
  isAdmin,
  uploadProductImages,
  validateHasCoverImage,
  validate(productSchema),
  createProduct
);

router.put(
  '/admin/products/:id',
  authenticateToken,
  isAdmin,
  uploadProductImages,
  validateHasCoverImage,
  validate(productSchema),
  updateProduct
);

router.delete('/admin/products/:id', authenticateToken, isAdmin, deleteProductById);

router.get('/admin/products/:id/images', authenticateToken, isAdmin, getProductImagesByProductId);

router.post(
  '/admin/products/:id/images',
  authenticateToken,
  isAdmin,
  uploadProductImages,
  uploadProductImage
);

router.delete(
  '/admin/products/:id/images/:imageId',
  authenticateToken,
  isAdmin,
  removeProductImage
);

router.get('/products', getAllProducts);
router.get('/products/:id', getProductById);
module.exports = router;
