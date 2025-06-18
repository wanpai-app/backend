const jwt = require('jsonwebtoken');
const db = require('../configs/db');
const { usersTable } = require('../models/userSchema');
const { eq } = require('drizzle-orm');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未提供正確的 Authorization 標頭' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await db.select().from(usersTable).where(eq(usersTable.id, decoded.id)).limit(1);
    if (user.length === 0) {
      return res.status(401).json({ error: '使用者不存在' });
    }

    req.user = user[0];
    next();
  } catch {
    return res.status(403).json({ error: 'Token 驗證失敗' });
  }
};

module.exports = authenticateToken;
