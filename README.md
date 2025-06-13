# WanPai 玩派 - 後端專案

## 簡介

本專案為「WanPai 玩派」模型電商網站的後端服務，網站支援用戶註冊、登入，管理個人帳戶與訂單，同時提供完善的後台商品管理功能，讓商品資料能即時更新與展示；及金流串接台灣第三方支付服務 ECPay 綠界科技，享有安全的金流交易。

## 使用技術

本專案使用了以下技術與套件：

- Node.js + Express
- PostgreSQL + Drizzle ORM
- bcryptjs
- jsonwebtoken (JWT)
- zod
- ecpay_aio_nodejs
- AWS S3

## 功能簡介

- 使用者註冊與登入（密碼加密 + JWT 驗證）
- 商品資料 CRUD 操作
- 訂單建立與管理
- 綠界金流串接（含付款通知處理）
- Zod 驗證處理輸入資料
- Drizzle ORM 支援軟刪除與狀態控制欄位
- AWS S3（圖片儲存）

## 安裝及執行步驟

### 環境需求

- Node.js（建議 v18 以上）
- PostgreSQL 資料庫（請先建立資料庫）

1. Clone 此 Repository

```bash
 git clone https://github.com/wanpai-app/backend.git
 cd backend
```

2. 安裝 npm 相關套件

```bash
 npm install
```

3. 設定環境變數
   建立 `.env` 檔案，並依照 `.env.template` 或下方格式填入必要變數：

```
DATABASE_URL=
ECPAY_MERCHANT_ID=
ECPAY_HASH_KEY=
ECPAY_HASH_IV=
ECPAY_RETURN_URL=
ECPAY_CLIENT_BACK_URL=

PORT=3000
JWT_SECRET=
```

4.建立資料表結構
使用 Drizzle CLI 工具自動產生與套用遷移檔：

```
  npm run generate
  npm run migrate
```

5. 啟動開發伺服器

```bash
 npm run dev
```

啟動後預設會在 http://localhost:3000 執行後端伺服器。

## 團隊成員

- 彭芷儀 [GitHub](https://github.com/yura813)

- 張馨云 [GitHub](https://github.com/kirua05)

- 林欣雨 [GitHub](https://github.com/Raelin930)

- 巫坤郁 [GitHub](https://github.com/kenyykd)

- 謝聿涵 [GitHub](https://github.com/hsiehyuhan)

- 侯建男 [GitHub](https://github.com/Nannn1997)

- 楊子毅 [GitHub](https://github.com/ziyi1998)

- 吳禹慧 [GitHub](https://github.com/rosewuuu)

## 其他

本專案為課程小組專案，僅供學術用途。
