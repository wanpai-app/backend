

const db = require('../src/configs/db'); 
const { eq } = require('drizzle-orm');
const { ordersTable } = require('../src/models/orderSchema');
const { usersTable }  = require('../src/models/userSchema');

async function insertFakeOrder() {
  try {
    const user = await db.select().from(usersTable).where(eq(usersTable.id, 1));

    if (user.length === 0) {
      console.log(' 找不到 userId = 1 的使用者，請先執行 seed-users.js');
      process.exit(1);
    }

    // 插入假訂單
    await db.insert(ordersTable).values({
      orderNumber: 'A88888888',
      userId: 1, // 連到剛剛那位使用者
      recipientName: '雨雨',
      recipientPhone: '0912345678',
      shippingAddress: '台北市夢想路 1 號',
      totalPrice: 999,
      quantity: 2,
      status: 'paid',
    });

    console.log(' 假訂單插入成功！可以開始測試 API 囉～');
    process.exit(0);
  } catch (err) {
    console.error(' 插入訂單失敗：', err);
    process.exit(1);
  }
}

insertFakeOrder(); 

