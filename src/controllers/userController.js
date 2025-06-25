const bcrypt = require('bcryptjs');
const db = require('../configs/db');
const jwt = require('jsonwebtoken');
const { usersTable } = require('../models/userSchema');
const { eq, and, not } = require('drizzle-orm');

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: '請填寫所有欄位' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: '請輸入正確的 Email 格式' });
  }

  try {
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));

    if (existing.length > 0) {
      return res.status(409).json({ error: '此 email 已被註冊' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.insert(usersTable).values({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: '註冊成功' });
  } catch (err) {
    res.status(500).json({ error: '伺服器錯誤', detail: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: '請輸入 email 和密碼' });
  }

  try {
    const user = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);

    if (user.length === 0) {
      return res.status(401).json({ error: 'Email 或密碼錯誤' });
    }

    if (user[0].provider !== 'local') {
      return res.status(403).json({ error: '請使用第三方登入方式' });
    }

    const isPasswordValid = await bcrypt.compare(password, user[0].password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Email 或密碼錯誤' });
    }

    const token = jwt.sign(
      { id: user[0].id, email: user[0].email, role: user[0].role },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d',
      }
    );

    res.status(200).json({ message: '登入成功', token, role: user[0].role });
  } catch {
    res.status(500).json({ error: '伺服器錯誤，請稍後再試' });
  }
};

const getProfile = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await db
      .select({
        username: usersTable.username,
        email: usersTable.email,
        phone: usersTable.phone,
        address: usersTable.address,
      })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);
    if (result.length === 0) return res.status(404).json({ message: '會員不存在' });
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤', error: err.message });
  }
};

const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { username, email, phone, address } = req.body;

  if (!username || !email) {
    return res.status(400).json({ error: '請提供 username 與 email' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Email 格式錯誤' });
  }

  try {
    const existing = await db
      .select()
      .from(usersTable)
      .where(and(eq(usersTable.email, email), not(eq(usersTable.id, userId))));

    if (existing.length > 0) {
      return res.status(409).json({ error: '此 email 已被其他會員使用' });
    }

    await db
      .update(usersTable)
      .set({ username, email, phone, address })
      .where(eq(usersTable.id, userId));

    res.json({ message: '更新成功' });
  } catch (err) {
    res.status(500).json({ message: '更新失敗', error: err.message });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
};
