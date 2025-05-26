const express = require("express");
const router = express.Router();
const {
  createOrder,
  handleReturn,
  clientReturn,
} = require("../../controllers/ecpay/ecpayController");
router.post("/create-order", createOrder);

router.post("/return", handleReturn);

router.get("/clientReturn", clientReturn);

module.exports = router;
