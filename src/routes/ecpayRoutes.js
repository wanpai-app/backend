const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const { createOrder, handleReturn, clientReturn } = require('../controllers/ecpayController');
router.post('/create-order', createOrder);

router.post('/return', handleReturn);

router.get('/clientReturn', clientReturn);
=======
const { createOrder, handleReturn } = require('../controllers/ecpayController');
router.post('/create-order', createOrder);

router.post('/handleReturn', handleReturn);


>>>>>>> d08ccc1 (feat: add ngrok file)

module.exports = router;
