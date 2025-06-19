const express = require('express');
const router = express.Router();
const { getAllFilterTags, getProductsByTagnames } = require('../controllers/tagsController');
router.get('/tags/filter', getAllFilterTags);

router.get('/tags/filterByTagnames', getProductsByTagnames);

module.exports = router;
