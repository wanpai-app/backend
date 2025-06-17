const db = require('../configs/db');
const { cartItemsTable } = require('../models/cartSchema');
const { productsTable } = require('../models/productSchema');
const { eq, and } = require('drizzle-orm');

// 获取用户的购物车
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItems = await db
      .select({
        id: cartItemsTable.id,
        productId: cartItemsTable.productId,
        quantity: cartItemsTable.quantity,
        priceAtAdd: cartItemsTable.priceAtAdd,
        addedAt: cartItemsTable.addedAt,
        product: {
          name: productsTable.name,
          sku: productsTable.sku,
        },
      })
      .from(cartItemsTable)
      .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
      .where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.softDel, false)));

    res.json(cartItems);
  } catch (err) {
    console.error('取得購物車失敗:', err);
    res.status(500).json({ error: '取得購物車失敗' });
  }
};

// 添加商品到购物车
const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ error: '請提供有效的PRODUCT_ID和數量' });
    }

    // 检查商品是否存在
    const product = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, productId))
      .limit(1);

    if (product.length === 0) {
      return res.status(404).json({ error: '商品不存在' });
    }

    // 检查是否已在购物车中
    const existingItem = await db
      .select()
      .from(cartItemsTable)
      .where(
        and(
          eq(cartItemsTable.userId, userId),
          eq(cartItemsTable.productId, productId),
          eq(cartItemsTable.softDel, false)
        )
      )
      .limit(1);

    if (existingItem.length > 0) {
      // 更新數量
      const [updatedItem] = await db
        .update(cartItemsTable)
        .set({
          quantity: existingItem[0].quantity + quantity,
          updatedAt: new Date(),
        })
        .where(eq(cartItemsTable.id, existingItem[0].id))
        .returning();

      return res.json(updatedItem);
    }

    // 新增商品到購物車
    const [newItem] = await db
      .insert(cartItemsTable)
      .values({
        userId,
        productId,
        quantity,
        priceAtAdd: product[0].price,
        addedAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    res.status(201).json(newItem);
  } catch (err) {
    console.error('加入購物車失敗:', err);
    res.status(500).json({ error: '加入購物車失败' });
  }
};

// 更新購物車商品數量
const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartItemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: '請提供有效的數量' });
    }

    const [updatedItem] = await db
      .update(cartItemsTable)
      .set({
        quantity,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(cartItemsTable.id, cartItemId),
          eq(cartItemsTable.userId, userId),
          eq(cartItemsTable.softDel, false)
        )
      )
      .returning();

    if (!updatedItem) {
      return res.status(404).json({ error: '購物車商品不存在' });
    }

    res.json(updatedItem);
  } catch (err) {
    console.error('更新購物車失敗:', err);
    res.status(500).json({ error: '更新購物車失敗' });
  }
};

// 從購物車中刪除商品（軟刪除）
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartItemId } = req.params;

    const [deletedItem] = await db
      .update(cartItemsTable)
      .set({
        softDel: true,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(cartItemsTable.id, cartItemId),
          eq(cartItemsTable.userId, userId),
          eq(cartItemsTable.softDel, false)
        )
      )
      .returning();

    if (!deletedItem) {
      return res.status(404).json({ error: '購物車商品不存在' });
    }

    res.json({ message: '商品已從購物車中移除' });
  } catch (err) {
    console.error('從購物車移除商品失敗:', err);
    res.status(500).json({ error: '從購物車移除商品失敗' });
  }
};

// 清空購物車（軟刪除所有項目）
const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    await db
      .update(cartItemsTable)
      .set({
        softDel: true,
        updatedAt: new Date(),
      })
      .where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.softDel, false)));

    res.json({ message: '購物車已清空' });
  } catch (err) {
    console.error('清空購物車失敗:', err);
    res.status(500).json({ error: '清空購物車失敗' });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
