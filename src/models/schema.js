module.exports = {
  ...require('./userSchema'),
  ...require('./orderSchema'),
  ...require('./productSchema'),
  ...require('./orderItemSchema'),
  ...require('./ecpaySchema'),
  ...require('./notificationSchema'),
  ...require('./stockLogSchema'),
  ...require('./productImageSchema'),
};
// 這個檔案是用來匯出所有的 schema 模組，方便其他檔案引用
