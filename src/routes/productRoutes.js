const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

// for users
router.get("/products", getAllProducts);
router.get("/products/:id", getProductById);

// for admin (之後可加 middleware 驗證 isAdmin)
router.get("/admin/products", getAllProducts);
router.get("/admin/products/:id", getProductById);
router.post("/admin/products", createProduct);
router.put("/admin/products/:id", updateProduct);
router.delete("/admin/products/:id", deleteProduct);

module.exports = router;
