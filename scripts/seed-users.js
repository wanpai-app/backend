/**
 * 🧪 [測試用] seed-users.js
 *
 * 這份檔案用來產生假使用者資料，方便本地測試會員／訂單相關功能。
 *
 * 注意：
 * - 請勿上傳真實密碼，此處皆為測試資料。
 * - 請在資料庫清空或切換環境後再執行，避免資料重複。
 *
 * 使用方式：
 *   node scripts/seed-users.js  # ➜ 如果資料表裡已經有 id=1，就會跳過
 *   node scripts/seed-users.js --reset # ➜ 清空 orders 和 users，再新增
 */

const db = require('./db-raw');
const { eq } = require('drizzle-orm');
const { usersTable } = require('../src/models/userSchema');
const minimist = require('minimist');
const { sql } = require('drizzle-orm');

const args = minimist(process.argv.slice(2));

async function insertFakeUsers() {
  try {
    if (args.reset) {
      await db.execute(sql`DELETE FROM orders`);
      await db.execute(sql`DELETE FROM users`);
      console.log('🧹 已清空 orders 和 users 資料表');
    }

    const exists = await db.select().from(usersTable).where(eq(usersTable.id, 1));

    if (exists.length > 0) {
      console.log('已有 id=1 的使用者，略過新增');
      process.exit(0);
    }

    await db.insert(usersTable).values([
      {
        id: 1,
        username: 'yuyu',
        email: 'yuyu@example.com',
        password: '123456', // 測試用密碼
        role: 'user',
      },
      {
        id: 2,
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123', // 測試用密碼
        role: 'admin',
      },
    ]);

    console.log(' 成功新增 user 和 admin 使用者');
    process.exit(0);
  } catch (err) {
    console.error(' 新增使用者失敗：', err);
    process.exit(1);
  }
}

insertFakeUsers();
