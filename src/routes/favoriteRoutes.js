const express = require('express');
const router = express.Router();
const { eq, and } = require('drizzle-orm');
const db = require('../configs/db');
const { favoritesTable } = require('../models/favoriteSchema');
const authenticateToken = require('../middleware/auth');

router.post('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.body;

  try {
    await db.insert(favoritesTable).values({ userId, productId });
    res.status(201).json({ message: '已加入收藏' });
  } catch (err) {
    console.error('新增收藏失敗：', err);
    res.status(500).json({ error: '收藏失敗，可能已存在' });
  }
});

router.delete('/:productId', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const productId = Number(req.params.productId);

  try {
    await db
      .delete(favoritesTable)
      .where(and(eq(favoritesTable.userId, userId), eq(favoritesTable.productId, productId)));
    res.json({ message: '已取消收藏' });
  } catch (err) {
    console.error('取消收藏失敗：', err);
    res.status(500).json({ error: '取消收藏失敗' });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const favorites = await db
      .select()
      .from(favoritesTable)
      .where(eq(favoritesTable.userId, userId));
    res.json(favorites);
  } catch (err) {
    console.error('取得收藏失敗：', err);
    res.status(500).json({ error: '無法取得收藏清單' });
  }
});

module.exports = router;
