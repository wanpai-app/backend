require("dotenv").config();
const ecpayConfig = require("../../configs/ecpay/ecpayConfig");
const ecpay_payment = require("ecpay_aio_nodejs");
// const { MERCHANTID, HASHKEY, HASHIV, HOST } = process.env;
const db = require("../configs/db");
const { orders } = require("../models/ecpaySchema");
const { eq } = require("drizzle-orm");

const options = {
  OperationMode: "Test", // Test or Production
  MercProfile: {
    MerchantID: ecpayConfig.merchantID,
    HashKey: ecpayConfig.hashKey,
    HashIV: ecpayConfig.hashIV,
  },
  IgnorePayment: [],
  IsProjectContractor: false,
};

// 處理 /create-order 的邏輯
exports.createOrder = async (req, res) => {
  const {
    MerchantTradeNo,
    MerchantTradeDate,
    TotalAmount,
    TradeDesc,
    ItemName,
  } = req.body;

  // 強化驗證，確保所有必需欄位都有
  if (
    !MerchantTradeNo ||
    !MerchantTradeDate ||
    !TotalAmount ||
    !TradeDesc ||
    !ItemName
  ) {
    return res
      .status(400)
      .json({ error: "缺少必要的訂單資訊，請確認所有欄位都已提供。" });
  }

  let base_param = {
    MerchantTradeNo: MerchantTradeNo,
    MerchantTradeDate: MerchantTradeDate,
    TotalAmount: TotalAmount, // 這裡的 TotalAmount 應該是字串形式，如 "100"
    TradeDesc: TradeDesc,
    ItemName: ItemName,
    ReturnURL: ecpayConfig.returnURL, // 從 ecpayConfig 獲取
    ClientBackURL: ecpayConfig.clientBackURL, // 從 ecpayConfig 獲取
    PaymentType: "aio", // 根據綠界文件建議，增加此欄位
  };

  const create = new ecpay_payment(options);
  const html = create.payment_client.aio_check_out_all(base_param);

  try {
    // 將訂單資訊存入資料庫
    await db.insert(orders).values({
      merchantTradeNo: MerchantTradeNo,
      merchantTradeDate: MerchantTradeDate,
      totalAmount: TotalAmount,
      tradeDesc: TradeDesc,
      itemName: ItemName,
      tradeStatus: "pending", // 初始狀態設為 pending
    });

    res.json({
      message: "訂單建立成功，請使用 ecpayHtml 進行跳轉。",
      merchantTradeNo: MerchantTradeNo,
      ecpayHtml: html,
    });
  } catch (error) {
    console.error("儲存訂單到資料庫失敗:", error);
    res.status(500).json({ error: "建立訂單失敗，請稍後再試。" });
  }
};

// 處理 /return 的邏輯
exports.handleReturn = async (req, res) => {
  console.log("綠界回傳資料 (POST):", req.body);

  const { CheckMacValue } = req.body;
  const data = { ...req.body };
  delete data.CheckMacValue;

  const create = new ecpay_payment(options);
  const checkValue = create.payment_client.helper.gen_chk_mac_value(data);

  console.log(
    "綠界驗證結果：",
    CheckMacValue === checkValue,
    "回傳 CheckMacValue:",
    CheckMacValue,
    "計算 CheckMacValue:",
    checkValue
  );

  res.send("1|OK");
};

// 處理 /clientReturn 的邏輯
exports.clientReturn = (req, res) => {
  console.log("用戶跳轉回您的網站 (GET):", req.body, req.query);
  res.render("return", { query: req.query }); // 假設您有設定視圖引擎
};
