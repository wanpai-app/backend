const express = require('express');
const router = express.Router();

const { notificationsTable } = require('../models/notificationSchema');
const { eq, desc } = require('drizzle-orm');
const db = require('../configs/db');
const authenticateToken = require('../middleware/auth');

// 取得通知列表：GET /api/notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.userId, userId))
      .orderBy(desc(notificationsTable.createdAt));

    res.json(notifications);
  } catch (error) {
    console.error('取得通知失敗：', error);
    res.status(500).json({ error: '伺服器錯誤，無法取得通知' });
  }
});

// 建立一筆通知：POST /api/notifications
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, message, orderId } = req.body;

    await db.insert(notificationsTable).values({
      userId,
      type,
      message,
      orderId,
    });

    res.status(201).json({ message: '通知已建立' });
  } catch (error) {
    console.error('建立通知失敗：', error);
    res.status(500).json({ error: '建立通知失敗' });
  }
});

module.exports = router;
