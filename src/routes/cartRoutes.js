const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require('../controllers/cartController');
const authenticateToken = require('../middleware/auth');

// 讓所有購物車路由都需要 JWT 驗證
router.use(authenticateToken);

// 取得購物車
router.get('/', getCart);

// 新增商品到購物車
router.post('/', addToCart);

// 更新購物車商品數量
router.put('/:cartItemId', updateCartItem);

// 移除購物車商品
router.delete('/:cartItemId', removeFromCart);

// 清空購物車
router.delete('/', clearCart);

module.exports = router;
