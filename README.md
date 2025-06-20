# WanPai 玩派 - 後端專案

## 簡介

本專案為「WanPai 玩派」模型電商網站的後端服務，網站支援用戶註冊、登入，管理個人帳戶與訂單，同時提供完善的後台商品管理功能，讓商品資料能即時更新與展示；及金流串接台灣第三方支付服務 ECPay 綠界科技，享有安全的金流交易。

## 使用技術

本專案使用了以下技術與套件：

- Node.js + Express
- PostgreSQL + Drizzle ORM
- bcryptjs
- JSON Web Tokens (JWT)
- Zod
- ECPayAIO_Node.js（綠界金流）
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
  - 新增編輯商品功能
  - 後台訂單管理
  - 資料庫架構設計
- 張馨云 [GitHub](https://github.com/kirua05)

  - Python 爬蟲清理商品資料，匯入至 PostgreSQL 資料庫
  - 單一商品頁面
  - AWS S3 雲端資料庫連接

- 林欣雨 [GitHub](https://github.com/Raelin930)

  - 訂單管理頁面實作
  - 訂單 API
  - 資料庫

- 巫坤郁 [GitHub](https://github.com/kenyykd)
  - 串接綠界金流
  - 購物車詳細資料切版
  - 商品標籤
- 謝聿涵 [GitHub](https://github.com/hsiehyuhan)

  - 串接購物車
  - 資料庫
  - 登入使用者處理購物車資料方式

- 侯建男 [GitHub](https://github.com/Nannn1997)
  - 網站首頁切版
  - 商品資料串接
  - 搜尋商品功能
- 楊子毅 [GitHub](https://github.com/ziyi1998)

  - 登入註冊功能
  - 會員編輯資料功能
  - 資料庫

- 吳禹慧 [GitHub](https://github.com/rosewuuu)
  - 通知頁面
  - 資料庫
  - 技術簡報製作

## 其他

本專案為課程小組專案，僅供學術用途。
