const express = require('express');
const router = express.Router();
const { login, register, getProfile, updateProfile } = require('../controllers/userController');
const authenticateToken = require('../middleware/auth');

router.post('/login', login);

router.post('/register', register);

router.get('/profile', authenticateToken, getProfile);

router.put('/profile', authenticateToken, updateProfile);

module.exports = router;
