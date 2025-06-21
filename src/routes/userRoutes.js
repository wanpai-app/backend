const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/auth');
const { googleAuth, googleAuthCallback } = require('../controllers/ouathController');

router.post('/register', userController.register);
router.post('/login', userController.login);

router.get('/test-token', authenticateToken, (req, res) => {
  res.json({
    message: 'Token 驗證成功',
    user: req.user,
  });
});

router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, userController.updateProfile);

module.exports = router;
