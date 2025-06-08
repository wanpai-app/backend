/**
 * 🧪 [測試用] seed-orders.js
 *
 * 這份檔案用來產生假訂單資料，方便本地測試 API。
 *
 * 使用方式：
 *   node scripts/seed-orders.js
 *   node scripts/seed-orders.js --count=10  // 指定筆數
 */
const db = require('../src/configs/db');
const { eq } = require('drizzle-orm');
const { ordersTable, orderStatusEnum } = require('../src/models/orderSchema');
const { usersTable } = require('../src/models/userSchema');
const { faker } = require('@faker-js/faker');
const minimist = require('minimist');

const args = minimist(process.argv.slice(2));
const count = args.count || 10;

function generateOrderNumber(index) {
  const today = new Date();
  const yyyyMMdd = today.toISOString().slice(0, 10).replace(/-/g, '');
  const serial = String(index + 1).padStart(4, '0');
  return `OD-${yyyyMMdd}-${serial}`;
}

const statusOptions = [
  'paid',
  'cancelled',
  'refunded',
  'shipped',
  'delivered',
  'returned',
];

async function insertFakeOrders() {
  try {
    const users = await db.select().from(usersTable);
    if (users.length === 0) {
      console.log(' 沒有使用者資料，請先執行 seed-users.js');
      return;
    }

    const orders = Array.from({ length: count }, (_, index) => {
      const user = faker.helpers.arrayElement(users);
      return {
        orderNumber: generateOrderNumber(index),
        userId: user.id,
        recipientName: faker.person.fullName(),
        recipientPhone: faker.phone.number('09########'),
        shippingAddress: faker.location.streetAddress({ useFullAddress: true }),
        totalPrice: faker.number.int({ min: 500, max: 5000 }),
        quantity: faker.number.int({ min: 1, max: 5 }),
        status: faker.helpers.arrayElement(statusOptions),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    await db.insert(ordersTable).values(orders);
    console.log(` 成功插入 ${count} 筆訂單資料！`);
  } catch (err) {
    console.error(' 插入訂單失敗：', err);
  }
}

insertFakeOrders();
