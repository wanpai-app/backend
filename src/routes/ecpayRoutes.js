const express = require('express');
const router = express.Router();
const { createOrder, handleReturn } = require('../controllers/ecpayController');
router.post('/create-order', createOrder);

router.post('/handleReturn', handleReturn);

module.exports = router;
