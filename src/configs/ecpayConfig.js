require("dotenv").config();

module.exports = {
  merchantID: process.env.ECPAY_MERCHANT_ID,
  hashKey: process.env.ECPAY_HASH_KEY,
  hashIV: process.env.ECPAY_HASH_IV,
  returnURL: process.env.ECPAY_RETURN_URL,
  clientBackURL: process.env.ECPAY_CLIENT_BACK_URL,
  isTestMode: true,
};
