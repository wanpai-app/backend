require("dotenv").config();

module.exports = {
  merchantID: process.env.ECPAY_MERCHANT_ID,
  hashKey: process.env.ECPAY_HASH_KEY,
  hashIV: process.env.ECPAY_HASH_IV,
  returnURL: process.env.ECPAY_RETURN_URL, // 綠界支付結果回傳的後端 URL
  clientBackURL: process.env.ECPAY_CLIENT_BACK_URL, // 支付完成後，消費者點擊返回的網頁 URL
  // isTestMode 將直接寫死為 true 或 false
  // 如果您希望只在測試模式下運行，設定為 true
  // 如果您已經準備好上線正式環境，請設定為 false
  isTestMode: true, // 或者設定為 false (正式環境)
};
