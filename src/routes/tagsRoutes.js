const express = require('express');

const router = express.Router();
const { getTagTypes, getProductsByTag } = require('../controllers/tagsController');

router.get('/tag-types', getTagTypes);

router.get('/products-by-tag', getProductsByTag);

module.exports = router;
