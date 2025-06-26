const express = require('express');
const router = express.Router();
const { getRandomProducts } = require('../controllers/productRecommendController');

router.get('/products/random', getRandomProducts);

module.exports = router;
