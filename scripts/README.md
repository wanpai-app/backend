## 專案種子資料（seed）初始化完整指南

這份文件會說明：

- 每支 seed 腳本功能
- 執行順序
- 查詢資料方式
- schema.js 設定補充

---

## `scripts/` 目錄說明

| 檔名                        | 功能簡述                                    |
| --------------------------- | ------------------------------------------- |
| `seed-users.js`             | 新增假使用者（1 名 user + 1 名 admin）      |
| `seed-products.js`          | 新增假商品（含名稱、價格、sku 等欄位）      |
| `seed-product-images.js`    | 為每個商品新增 1～3 張圖片並設定封面        |
| `seed-orders-with-items.js` | 新增訂單與對應的商品明細，自動帶入封面圖    |
| `db-raw.js`                 | 專用 drizzle ORM 用戶端，避免動到共用 db.js |

---

## 執行順序建議

```bash
npm run generate
npm run migrate

node scripts/seed-users.js
node scripts/seed-products.js
node scripts/seed-product-images.js
node scripts/seed-orders-with-items.js --count=5
```

`--count=5` 可自行決定建立幾筆訂單

---

## 查詢資料方式（pgAdmin 或 SQL）

### 查詢所有訂單

```sql
SELECT * FROM orders ORDER BY id ASC;
```

### 查某筆訂單有哪些商品

```sql
SELECT * FROM order_items WHERE order_id = 1;
```

### 查詢所有商品圖片

```sql
SELECT * FROM product_images ORDER BY id ASC;
```

### 查詢封面圖（主圖）

```sql
SELECT * FROM product_images WHERE is_cover = true;
```

### 查某個商品所有圖片（依順序）

```sql
SELECT * FROM product_images WHERE product_id = 2 ORDER BY order_index ASC;
```

---

## schema.js 是什麼？

### `drizzle.config.js` 中這段：

```js
schema: './src/models/schema.js';
```

代表 drizzle 在 `generate` 時會去讀這份檔案，抓出所有資料表結構。

### 建議寫這個檔案（集中 export 所有 table）

```js
// src/models/schema.js
module.exports = {
  usersTable,
  productsTable,
  productImagesTable,
  ordersTable,
  orderItemsTable,
  stockLogsTable,
  notificationsTable,
  ecpayOrdersTable,
};
```

這樣 drizzle 產生的 migration 就會包含完整表結構，對團隊維護與初始化開發非常有幫助。

---

## 注意事項提醒

- 一定要先 seed user 和 product 才能建立訂單
- `seed-product-images.js` 設定第一張為主圖（is_cover = true）
- 若遇 schema 改動需重新 generate + migrate
- 建議每次測試前清空資料或建立新資料庫，避免舊資料干擾

---

## 成果驗證

成功執行後，可在 pgAdmin 查詢：

- `orders` 有建立好的訂單（recipient_name、total_price 等）
- `order_items` 有商品明細（含商品名稱與圖片）
- `product_images` 有封面圖（is_cover = true）
