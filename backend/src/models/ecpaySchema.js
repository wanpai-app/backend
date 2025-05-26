const {
  pgTable,
  serial,
  varchar,
  integer,
  numeric,
  timestamp,
  text,
} = require("drizzle-orm/pg-core");

exports.orders = pgTable("orders", {
  id: serial("id").primaryKey(), // 資料庫自動生成的唯一 ID
  merchantTradeNo: varchar("merchant_trade_no", { length: 50 }).notNull(), // 你的訂單編號，對應綠界的 MerchantTradeNo
  ecpayTradeNo: varchar("ecpay_trade_no", { length: 20 }), // 綠界回傳的交易編號 (TradeNo)
  merchantTradeDate: varchar("merchant_trade_date", { length: 20 }).notNull(), // 訂單建立日期時間
  totalAmount: numeric("total_amount").notNull(), // 訂單總金額
  tradeDesc: varchar("trade_desc", { length: 200 }), // 交易描述
  itemName: varchar("item_name", { length: 200 }), // 商品名稱
  paymentType: varchar("payment_type", { length: 20 }), // 付款方式 (例如 All, Credit, ATM, CVS)
  tradeStatus: varchar("trade_status", { length: 50 }).default("pending"), // 訂單狀態 (pending, success, failed, refunded, etc.)
  rtnCode: integer("rtn_code"), // 綠界回傳的交易狀態碼
  rtnMsg: text("rtn_msg"), // 綠界回傳的交易訊息
  paymentDate: varchar("payment_date", { length: 20 }), // 綠界回傳的付款完成時間
  simulatePaid: integer("simulate_paid"), // 綠界模擬付款狀態 (0: 未模擬付款, 1: 已模擬付款)
  checkMacValue: varchar("check_mac_value", { length: 100 }), // 綠界回傳的 CheckMacValue
  createdAt: timestamp("created_at").defaultNow(), // 訂單創建時間
  updatedAt: timestamp("updated_at").defaultNow(), // 訂單更新時間
});
