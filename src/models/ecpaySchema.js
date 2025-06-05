const {
  pgTable,
  serial,
  varchar,
  integer,
  numeric,
  timestamp,
  text,
} = require('drizzle-orm/pg-core');

const ecpayOrdersTable = pgTable('ecpay_orders', {
  id: serial('id').primaryKey(),
  merchantTradeNo: varchar('merchant_trade_no', { length: 50 }).notNull(),
  ecpayTradeNo: varchar('ecpay_trade_no', { length: 20 }),
  merchantTradeDate: varchar('merchant_trade_date', { length: 20 }).notNull(),
  totalAmount: numeric('total_amount').notNull(),
  tradeDesc: varchar('trade_desc', { length: 200 }),
  itemName: varchar('item_name', { length: 200 }),
  paymentType: varchar('payment_type', { length: 20 }),
  tradeStatus: varchar('trade_status', { length: 50 }).default('pending'),
  rtnCode: integer('rtn_code'),
  rtnMsg: text('rtn_msg'),
  paymentDate: varchar('payment_date', { length: 20 }),
  simulatePaid: integer('simulate_paid'),
  checkMacValue: varchar('check_mac_value', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

module.exports = { ecpayOrdersTable };