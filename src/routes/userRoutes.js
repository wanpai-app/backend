const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/auth');

router.post('/register', userController.register);
router.post('/login', userController.login);

router.get('/profile', authenticateToken, (req, res) => {
  res.json({
    message: '已登入會員',
    user: req.user,
  });
});

module.exports = router;
