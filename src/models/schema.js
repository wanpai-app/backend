module.exports = {
  ...require('./userSchema'),
  ...require('./productSchema'),
  ...require('./productImageSchema'),
  ...require('./productTagSchema'),
  ...require('./tagsSchema'),
  ...require('./orderSchema'),
  ...require('./orderItemSchema'),
  ...require('./ecpaySchema'),
  ...require('./cartSchema'),
  ...require('./notificationSchema'),
  ...require('./stockLogSchema'),
};
// 這個檔案是用來匯出所有的 schema 模組，方便其他檔案引用
