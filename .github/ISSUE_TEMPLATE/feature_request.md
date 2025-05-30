---
name: Feature request
about: Suggest an idea for this project
title: feat
labels: ''
assignees: ''

---

### 功能描述
新增商品庫存顯示功能，讓使用者知道目前是否可以下單

### 背景與目的
- 使用者反應不知道是否還有庫存，導致白點下單流程

### 功能細節
- 若庫存數量 > 0 顯示「尚有庫存」
- 若為 0 顯示「已售完」，並將購買按鈕 disabled
- 串接後端 `/api/products/:id/stock`

### 補充資料
- 設計稿：https://www.figma.com/file/xxxx
- API 文件：https://backend.docs.api/stock

### 標籤
- `feat`
- `frontend`
