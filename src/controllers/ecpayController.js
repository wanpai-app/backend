require('dotenv').config();
const ecpayConfig = require('../configs/ecpayConfig');
const ecpay_payment = require('ecpay_aio_nodejs');
const db = require('../configs/db');
const { ecpayOrdersTable } = require('../models/ecpaySchema');
const { ordersTable } = require('../models/orderSchema');
const { eq } = require('drizzle-orm');
const { customAlphabet } = require('nanoid');
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

const generateOrderId = () => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  return `WP${dateStr}${nanoid()}`;
};

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
const create = new ecpay_payment(options);

exports.createOrder = async (req, res) => {
  const { TotalAmount, TradeDesc, ItemName } = req.body;
  const MerchantTradeNo = generateOrderId();
  const MerchantTradeDate = new Date()
    .toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
    .replace(/\//g, '/')
    .replace(/ /g, ' ');

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

  const html = create.payment_client.aio_check_out_all(base_param);

  try {
    await db.insert(ecpayOrdersTable).values({
      merchantTradeNo: MerchantTradeNo,
      merchantTradeDate: MerchantTradeDate,
      totalAmount: TotalAmount,
      tradeDesc: TradeDesc,
      itemName: ItemName,
      tradeStatus: 'pending',
    });

    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch {
    res.status(500).json({ error: '建立訂單失敗，請稍後再試。' });
  }
};

exports.handleReturn = async (req, res) => {
  console.log('綠界回傳資料 (POST):', req.body);
  const { CheckMacValue, MerchantTradeNo, RtnCode, RtnMsg, PaymentDate, SimulatePaid, TradeNo } =
    req.body;
  const data = { ...req.body };
  delete data.CheckMacValue;

  const create = new ecpay_payment(options);
  const checkValue = create.payment_client.helper.gen_chk_mac_value(data);

  // 1. 驗證 CheckMacValue
  if (CheckMacValue === checkValue) {
    // 2. 驗證成功，處理訂單狀態更新
    try {
      let newTradeStatus = 'pending';
      if (RtnCode === '1') {
        // 綠界回傳 RtnCode=1 表示交易成功
        newTradeStatus = 'paid';
        console.log(`訂單 ${MerchantTradeNo} 支付成功！`);
      } else {
        newTradeStatus = 'failed'; // 交易失敗
        console.log(`訂單 ${MerchantTradeNo} 支付失敗，RtnCode: ${RtnCode}, RtnMsg: ${RtnMsg}`);
      }

      await db
        .update(ecpayOrdersTable)
        .set({
          tradeStatus: newTradeStatus,
          rtnCode: parseInt(RtnCode),
          rtnMsg: RtnMsg,
          paymentDate: PaymentDate,
          ecpayTradeNo: TradeNo,
          simulatePaid: SimulatePaid ? parseInt(SimulatePaid) : null,
          checkMacValue: CheckMacValue,
          updatedAt: new Date(),
        })
        .where(eq(ecpayOrdersTable.merchantTradeNo, MerchantTradeNo));

      console.log(`資料庫訂單 ${MerchantTradeNo} 狀態已更新為 ${newTradeStatus}`);
      const [updatedOrder] = await db
        .update(ordersTable)
        .set({
          status: 'paid',
          updatedAt: new Date(),
        })
        .where(eq(ordersTable.orderNumber, MerchantTradeNo))
        .returning();
      console.log('訂單已成功更新：', updatedOrder);

      res.send('1|OK'); // 告知綠界已成功接收
    } catch (error) {
      console.error('更新訂單狀態時發生錯誤:', error);
      res.send('1|OK'); // 即使有錯誤，綠界仍需收到 1|OK
    }
  } else {
    console.error('CheckMacValue 驗證失敗！拒絕處理綠界回傳資料。');
    res.status(400).send('0|CheckMacValue Error'); // 告知綠界驗證失敗
  }
};
