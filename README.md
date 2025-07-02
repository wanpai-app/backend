# WanPai 玩派 - 後端專案

<img width="302" alt="image" src="https://github.com/user-attachments/assets/2292f271-7947-4849-acf8-aae897ba004f" />

## 簡介

本專案為「WanPai 玩派」模型電商網站的後端服務，網站支援用戶註冊、登入，管理個人帳戶與訂單，同時提供完善的後台商品管理功能，讓商品資料能即時更新與展示；及金流串接台灣第三方支付服務 ECPay 綠界科技，享有安全的金流交易。

## 專案由來

專案靈感來自於組員小南的困擾，

每次小南逛模型逛到想買的時候，卻總是缺乏即時的關鍵商品資訊，讓他難以下定決心，

常常逛老半天又空手而歸，逛街探索體驗不佳。

因此，我們打造了一個模型玩具電商平台，提供簡單的標籤分類和搜尋，讓消費者輕鬆尋找喜愛的商品，

商家後台也可以上傳詳細的商品圖文介紹與開箱影片，讓消費者在線上仔細查看商品的每個角度。

**玩派希望讓所有像小南一樣的模型玩具愛好者，都可以在線上享受實體逛街般的樂趣。**

**[>> 點擊進入玩派 <<](https://wanpai-frontend.zeabur.app/)**

## 主要功能

使用者可註冊登入會員，探索商品並加入收藏，加入購物車後可選擇商品及數量結帳。

商家帳號有權限開啟後台管理頁面，自由上下架商品，編輯商品資訊、管理商品及訂單。

<img width="590" alt="image" src="https://github.com/user-attachments/assets/9ff9bfe0-8ad3-45eb-b45a-c7220d435aee" />
<img width="590" alt="image" src="https://github.com/user-attachments/assets/acdbf69b-5829-4d68-a83a-f576be3310a1" />
<img width="590" alt="image" src="https://github.com/user-attachments/assets/3622479d-67ad-4d72-820d-8f43b4b6788c" />
<img width="590" alt="image" src="https://github.com/user-attachments/assets/7452451e-5996-481b-9833-8d24fe3a091a" />
<img width="590" alt="image" src="https://github.com/user-attachments/assets/101a6e88-7073-4bcb-90be-e3699f997447" />

## 使用技術

本專案使用了以下技術與套件：

- Node.js + Express
- PostgreSQL + Drizzle ORM
- bcryptjs
- JSON Web Tokens (JWT)
- Zod
- ECPayAIO_Node.js（綠界金流）
- AWS S3

## 後端功能簡介

- 使用者註冊與登入（密碼加密 + JWT 驗證）
- 綠界金流串接（含付款通知處理）
- Zod 驗證處理輸入資料
- Admin 權限管理
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
   建立 `.env` 檔案，並依照 `.env.production` 或下方格式填入必要變數：

```
DATABASE_URL=
ECPAY_MERCHANT_ID=
ECPAY_HASH_KEY=
ECPAY_HASH_IV=
ECPAY_RETURN_URL=
ECPAY_CLIENT_BACK_URL=

PORT=
JWT_SECRET=

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=
AWS_REGION=
AWS_S3_ENDPOINT=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FRONTEND_URL=
BACKEND_URL=

GEMINI_API_KEY=
```

4. 建立資料表結構
   使用 Drizzle CLI 工具自動產生與套用遷移檔：

```
  npm run generate
  npm run migrate
```

5. 啟動開發伺服器

```bash
 npm run dev
```

## 團隊成員

- 彭芷儀 [GitHub](https://github.com/yura813)

  - 新增編輯商品功能
  - 後台訂單管理
  - 後台庫存管理
  - 資料庫

- 張馨云 [GitHub](https://github.com/kirua05)

  - Python 爬蟲
  - 單一商品頁面實作
  - 上傳圖片功能
  - AWS S3 雲端資料庫

- 林欣雨 [GitHub](https://github.com/Raelin930)

  - 訂單管理頁面實作
  - 訂單 API
  - 網站 Landing Page

- 巫坤郁 [GitHub](https://github.com/kenyykd)

  - 串接綠界金流
  - 創建 Supabase 資料庫
  - 商品分類標籤
  - Gemini AI 串接

- 謝聿涵 [GitHub](https://github.com/hsiehyuhan)

  - 購物車頁面
  - 串接購物車 API
  - 資料庫
  - 加入購物車功能

- 侯建男 [GitHub](https://github.com/Nannn1997)

  - 商品瀏覽頁、分頁
  - 推薦商品功能
  - 搜尋商品功能
  - ZeaBur 部署專案

- 楊子毅 [GitHub](https://github.com/ziyi1998)

  - 登入註冊功能
  - 會員編輯資料功能
  - Google 第三方登入

- 吳禹慧 [GitHub](https://github.com/rosewuuu)
  - 通知頁面實作
  - 收藏功能
  - 資料庫

## 其他

本專案為課程小組專案，僅供學術用途。
