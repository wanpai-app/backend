// axiosInstance有點像前端的middleware，每次發送請求前可以做一些預處理跟驗證，例如自動附帶token
import axios from 'axios'

const instance = axios.create({
  // 設定baseURL: 'http://localhost:3000/api',統一API網址前綴
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
})

export default instance
