require('dotenv').config();
const ecpayConfig = require('../configs/ecpayConfig');
const ecpay_payment = require('ecpay_aio_nodejs');
const db = require('../configs/db');
const { ordersTable } = require('../models/ecpaySchema');

const options = {
  OperationMode: 'Test',
  MercProfile: {
    MerchantID: ecpayConfig.merchantID,
    HashKey: ecpayConfig.hashKey,
    HashIV: ecpayConfig.hashIV,
  },
  IgnorePayment: [],
  IsProjectContractor: false,
};

exports.createOrder = async (req, res) => {
  const { MerchantTradeNo, MerchantTradeDate, TotalAmount, TradeDesc, ItemName } = req.body;

  if (!MerchantTradeNo || !MerchantTradeDate || !TotalAmount || !TradeDesc || !ItemName) {
    return res.status(400).json({ error: '缺少必要的訂單資訊，請確認所有欄位都已提供。' });
  }

  let base_param = {
    MerchantTradeNo: MerchantTradeNo,
    MerchantTradeDate: MerchantTradeDate,
    TotalAmount: TotalAmount,
    TradeDesc: TradeDesc,
    ItemName: ItemName,
    ReturnURL: ecpayConfig.returnURL,
    ClientBackURL: ecpayConfig.clientBackURL,
    PaymentType: 'aio',
  };

  const create = new ecpay_payment(options);
  const html = create.payment_client.aio_check_out_all(base_param);

  try {
    await db.insert(ordersTable).values({
      merchantTradeNo: MerchantTradeNo,
      merchantTradeDate: MerchantTradeDate,
      totalAmount: TotalAmount,
      tradeDesc: TradeDesc,
      itemName: ItemName,
      tradeStatus: 'pending',
    });

    res.json({
      message: '訂單建立成功，請使用 ecpayHtml 進行跳轉。',
      merchantTradeNo: MerchantTradeNo,
      ecpayHtml: html,
    });
  } catch (error) {
    console.error('儲存訂單到資料庫失敗:', error);
    res.status(500).json({ error: '建立訂單失敗，請稍後再試。' });
  }
};

exports.handleReturn = async (req, res) => {
  console.log('綠界回傳資料 (POST):', req.body);

  const { CheckMacValue } = req.body;
  const data = { ...req.body };
  delete data.CheckMacValue;

  const create = new ecpay_payment(options);
  const checkValue = create.payment_client.helper.gen_chk_mac_value(data);

  console.log(
    '綠界驗證結果：',
    CheckMacValue === checkValue,
    '回傳 CheckMacValue:',
    CheckMacValue,
    '計算 CheckMacValue:',
    checkValue
  );

  res.send('1|OK');
};

exports.clientReturn = (req, res) => {
  console.log('用戶跳轉回您的網站 (GET):', req.body, req.query);
  res.render('return', { query: req.query });
};
