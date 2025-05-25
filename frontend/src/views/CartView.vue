<template>
  <div class="bg-black text-white min-h-screen flex flex-col">
    <header class="flex justify-between items-center px-4 py-2">
      <div class="flex items-center space-x-3">
        <img
          v-for="icon in topIcons"
          :key="icon.alt"
          :src="icon.src"
          :alt="icon.alt"
          class="w-6 h-6 filter invert cursor-pointer"
        />
        <span class="user-level font-medium">{{ userLevel }}</span>
        <img
          :src="iconLogoutSrc"
          alt="登出"
          class="w-6 h-6 filter invert cursor-pointer"
          @click="logout"
        />
      </div>
      <div class="flex items-center space-x-4">
        <img
          v-for="icon in socials"
          :key="icon.alt"
          :src="icon.src"
          :alt="icon.alt"
          class="w-6 h-6 filter invert hover:opacity-75 cursor-pointer"
        />
        <button class="p-2 hover:bg-gray-800 rounded">
          <img
            src="@/assets/img_shopping_cart/search.svg?url"
            alt="搜尋"
            class="w-6 h-6 filter invert"
          />
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 px-4 py-6 bg-gray-100 text-black">
      <div class="container mx-auto p-4 bg-white rounded shadow">
        <h1 class="text-2xl font-bold mb-6 text-gray-800">我的購物車</h1>

        <!-- 購物車列表-->
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-gray-800 text-white">
              <tr>
                <th class="px-4 py-2 text-left">品名</th>
                <th class="px-4 py-2 text-center">規格</th>
                <th class="px-4 py-2 text-center">數量</th>
                <th class="px-4 py-2 text-center">單價</th>
                <th class="px-4 py-2 text-center">小計</th>
                <th class="px-4 py-2 text-center">刪除</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in cart.items" :key="item.id" class="border-b hover:bg-gray-50">
                <!-- 品名 + 圖片 + 描述 -->
                <td class="px-4 py-4 flex items-start space-x-4">
                  <img v-if="item.image" :src="item.image" alt="" class="w-20 h-20 object-cover rounded" />
                  <div class="flex-1">
                    <div class="text-sm text-gray-500 mb-1" v-if="item.eta">預計{{ item.eta }}出貨</div>
                    <div class="font-medium text-gray-800">{{ item.title }}</div>
                  </div>
                </td>
                <!-- 規格 -->
                <td class="px-4 py-4 text-center text-gray-700">{{ item.variant || '單一規格' }}</td>
                <!-- 數量 -->
                <td class="px-4 py-4 text-center">
                  <select v-model.number="item.qty" @change="updateQty(item.id, item.qty)" class="border rounded px-2 py-1">
                    <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
                  </select>
                </td>
                <!-- 單價 -->
                <td class="px-4 py-4 text-center text-gray-700">{{ formatCurrency(item.price) }}</td>
                <!-- 小計 -->
                <td class="px-4 py-4 text-center font-medium text-gray-800">{{ formatCurrency(item.price * item.qty) }}</td>
                <!-- 刪除 -->
                <td class="px-4 py-4 text-center">
                  <button @click="remove(item.id)" class="text-red-500 hover:text-red-700">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 優惠區塊 -->
        <div class="bg-gray-100 p-4 mt-6 rounded">
          <div class="text-gray-700">
            <span class="text-red-600 font-semibold">• 現金積點</span>
            會員 滿 $100 元，現金積點回饋 2%
            <br />
            <span class="text-gray-500 text-sm">詳細請參閱「現金積點規則」。</span>
          </div>
          <div class="flex items-center space-x-6 mt-4">
            <label class="flex items-center space-x-2">
              <input type="radio" checked class="form-radio" />
              <span>不使用優惠</span>
            </label>
            <label class="flex items-center space-x-2 text-gray-400">
              <input type="radio" disabled class="form-radio" />
              <span>優惠代碼</span>
            </label>
          </div>
          <div class="mt-4 text-gray-600">
            <span class="mr-2">全館活動</span>
            <span class="text-red-600">再 ${{ threshold - cart.totalPrice }} 元，抵 ${{ discount }} 元</span>
            <span class="text-gray-400 ml-2">尚未符合</span>
          </div>
        </div>

        <!-- 小計 & 運費 & 總金額 -->
        <div class="mt-6 bg-white shadow rounded p-4">
          <div class="flex justify-between items-center border-b pb-2">
            <span>小計</span>
            <span class="font-medium">{{ formatCurrency(cart.totalPrice) }}</span>
          </div>
          <div class="flex justify-between items-center border-b py-2">
            <span>運費</span>
            <button @click="calculateShipping" class="text-red-500">前往下一步計算</button>
          </div>
          <div class="flex justify-between items-center pt-2">
            <span class="font-semibold">總金額 (TWD)</span>
            <span class="text-xl font-bold">{{ formatCurrency(cart.totalPrice + shipping) }}</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, toRefs, onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import iconMail from '@/assets/img_shopping_cart/icon-mail.svg?url'
import iconInfo from '@/assets/img_shopping_cart/icon-info.svg?url'
import iconCrown from '@/assets/img_shopping_cart/icon-crown.svg?url'
import iconLogout from '@/assets/img_shopping_cart/icon-logout.svg?url'
import facebookIcon from '@/assets/img_shopping_cart/facebook.svg?url'
import lineIcon from '@/assets/img_shopping_cart/line.svg?url'
import instagramIcon from '@/assets/img_shopping_cart/instagram.svg?url'
import youtubeIcon from '@/assets/img_shopping_cart/youtube.svg?url'
import blogIcon from '@/assets/img_shopping_cart/blog.svg?url'
import testProductImg from '@/assets/img_shopping_cart/test-product.png?url'

// 購物車狀態
const cart = useCartStore()

// 假設測試資料，若 cart 內無商品則加入預設，之後商品頁面串接完成要拿掉
onMounted(() => {
  if (!cart.items.length) {
     cart.add({ id: 'demo1', title: '範例商品 A', price: 880, image: testProductImg, variant: '單一規格', eta: '2025/11' })
     cart.add({ id: 'demo2', title: '範例商品 B', price: 650, image: testProductImg, variant: '單一規格' })
  }
})

// Top Bar
const userLevel = ref('玩具初心者')
const topIcons = [
  { src: iconMail, alt: '信箱' },
  { src: iconInfo, alt: '資訊' },
  { src: iconCrown, alt: '等級' }
]
const iconLogoutSrc = iconLogout
const socials = [
  { src: facebookIcon, alt: 'FB' },
  { src: lineIcon, alt: 'Line' },
  { src: instagramIcon, alt: 'IG' },
  { src: youtubeIcon, alt: 'YouTube' },
  { src: blogIcon, alt: 'Blog' }
]

function logout() {
  console.log('Logout clicked')
}

// 優惠計算
const threshold = 5000
const discount = 222

// 運費
const state = reactive({ shipping: 0 })
function calculateShipping() {
  state.shipping = cart.items.length ? 100 : 0
}

// 操作方法
function updateQty(id, qty) { cart.updateQty(id, qty) }
function remove(id) { cart.remove(id) }

// 幣別格式化
const formatCurrency = value => new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD' }).format(value)
const { shipping } = toRefs(state)
</script>

<style scoped>
.bg-gray-100 { background-color: #f7fafc; }
.text-black { color: #2d3748; }
</style>
