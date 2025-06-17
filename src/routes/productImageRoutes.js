const express = require('express');
const router = express.Router();
const upload = require('@middleware/upload');
const {
  createProductImage,
  updateProductImage,
  deleteProductImage,
} = require('../controllers/productImageController');

const authenticateToken = require('../middlewares/auth');
const isAdmin = require('../middleware/isAdmin');
const validate = require('../middleware/validate');
const { createProductImageSchema, updateProductImageSchema } = require('../validators/productImageValidator');

router.post(
  '/admin/productimage',
  authenticateToken,
  isAdmin,
  upload.single('image'),
  validate(createProductImageSchema),
  createProductImage
);
router.put(
  '/admin/productimage/:id',
  authenticateToken,
  isAdmin,
  upload.single('image'),
  validate(updateProductImageSchema),
  updateProductImage
);
router.delete(
  '/admin/productimage/:id',
  authenticateToken,
  isAdmin,
  deleteProductImage);

module.exports = router;
