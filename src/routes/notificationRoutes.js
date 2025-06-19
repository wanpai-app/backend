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

// 標記單筆通知為已讀 PATCH /api/notifications/:id/read
router.patch('/:id/read', authenticateToken, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: '無效的ID' });

  try {
    // 查詢這筆通知
    const [notification] = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.id, id));

    if (!notification) {
      return res.status(404).json({ error: '找不到通知' });
    }
    // 驗證只能標記自己的通知
    if (notification.userId !== req.user.id) {
      return res.status(403).json({ error: '沒有權限標記此通知' });
    }

    // 更新為已讀
    const [updatedNotification] = await db
      .update(notificationsTable)
      .set({ read: true })
      .where(eq(notificationsTable.id, id))
      .returning();

    res.json(updatedNotification);
  } catch (error) {
    console.error('標記已讀失敗：', error);
    res.status(500).json({ error: '伺服器錯誤，無法標記已讀' });
  }
});

module.exports = router;
