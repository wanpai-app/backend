const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const { addFavorite, removeFavorite, getFavorites } = require('../controllers/favoriteController');

router.post('/', authenticateToken, addFavorite);
router.delete('/:productId', authenticateToken, removeFavorite);
router.get('/', authenticateToken, getFavorites);

module.exports = router;
