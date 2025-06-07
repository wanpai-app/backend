// scripts/seed-users.js

const  db  = require('../src/configs/db');
const { eq } = require('drizzle-orm'); 
const { usersTable } = require('../src/models/userSchema');

async function insertFakeUser() {
  try {
    const exists = await db.select().from(usersTable).where(eq(usersTable.id, 1));


    if (exists.length > 0) {
      console.log(' 已有 id=1 的使用者，略過新增');
      process.exit(0);
    }

    await db.insert(usersTable).values({
      id: 1, 
      username: 'yuyu',
      email: 'yuyu@example.com',
      password: '123456', // 測試用
      role: 'user', 
    });

    console.log('✅ 成功新增一筆假使用者');
    process.exit(0);
  } catch (err) {
    console.error('❌ 新增使用者失敗：', err);
    process.exit(1);
  }
}

insertFakeUser();
