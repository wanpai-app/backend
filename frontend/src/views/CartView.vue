<template>
  <div class="bg-black text-white min-h-screen flex flex-col">
    <main class="flex-1 px-4 py-6 bg-gray-100 text-black">
      <div class="container mx-auto p-4 bg-white rounded shadow">
        <h1 class="text-2xl font-bold mb-6 text-gray-800">我的購物車</h1>

        <!-- 購物車列表 -->
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-gray-800 text-white">
              <tr class="border-b border-gray-700">
                <th class="px-4 py-2 w-12 text-center">
                  <input type="checkbox" class="custom-checkbox w-6 h-6 bg-white border-gray-400 focus:ring-2 focus:ring-primary-500" :checked="selectedItems.length === cart.items.length && cart.items.length > 0" @change="toggleSelectAll" />
                </th>
                <th class="px-4 py-2 text-left">品名</th>
                <th class="px-4 py-2 text-center">數量</th>
                <th class="px-4 py-2 text-center">單價</th>
                <th class="px-4 py-2 text-center">刪除</th>
              </tr>
            </thead>
            <tbody class="bg-white">
              <tr v-for="item in cart.items" :key="item.id" class="border-b border-gray-200 hover:bg-gray-50">
                <td class="px-4 py-4 text-center">
                  <input type="checkbox" class="custom-checkbox w-6 h-6 bg-white border-gray-400 focus:ring-2 focus:ring-primary-500" :checked="selectedItems.some(i => i.id === item.id)" @change="toggleSelectItem(item, $event)" />
                </td>
                <td class="px-4 py-4">
                  <div class="flex items-center space-x-4">
                    <img v-if="item.image" :src="item.image" alt="" class="w-20 h-20 object-cover rounded" />
                    <div class="flex-1 flex flex-col justify-center">
                      <div v-if="item.eta" class="text-sm text-gray-500 mb-1">預計 {{ item.eta }} 出貨</div>
                      <div class="font-medium text-gray-800">{{ item.title }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-4 text-center">
                  <select v-model.number="item.qty" @change="updateQty(item.id, item.qty)" class="border rounded px-2 py-1">
                    <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
                  </select>
                </td>
                <td class="px-4 py-4 text-center">{{ formatCurrency(item.price) }}</td>
                <td class="px-4 py-4 text-center">
                  <button @click="remove(item.id)" class="text-red-600 hover:text-red-800 focus:outline-none cursor-pointer">
                    <i class="pi pi-trash" style="font-size: 1.5rem"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 已選項目與合計 -->
        <div class="mt-4 text-gray-700">
          已選 {{ selectedCount }} 項，合計 {{ formatCurrency(selectedTotal) }}
        </div>

        <!-- 小計 & 運費 & 總金額 -->
        <div class="mt-6 bg-white shadow rounded p-4">
          <div class="flex justify-between items-center border-b pb-2">
            <span>小計</span>
            <span class="font-medium">{{ formatCurrency(selectedTotal) }}</span>
          </div>
          <div class="flex justify-between items-center border-b py-2">
            <span>運費</span>
            <span class="font-medium">{{ formatCurrency(shipping) }}</span>
          </div>
          <div class="flex justify-between items-center pt-2">
            <span class="font-semibold">總金額 (TWD)</span>
            <span class="text-xl font-bold">
              {{ formatCurrency(selectedTotal + shipping) }}
            </span>
          </div>
          <div class="flex justify-end mt-4">
            <Button
              label="前往結帳"
              icon="pi pi-shopping-cart"
              severity="primary"
              size="large"
              @click="checkout"
              :pt="{
                root: 'bg-primary hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center cursor-pointer',
                icon: 'mr-2 order-first',
                label: 'text-base order-last'
              }"
            />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, toRefs, onMounted, computed, watch } from 'vue'
import { useCartStore } from '@/stores/cart'
import Button from '@/volt/Button.vue'
import { testItems } from '@/components/CartItem.vue'

// Pinia 購物車狀態
const cart = useCartStore()

// 選中的商品列表
const selectedItems = ref([])

// 計算選中項目數量和金額
const selectedCount = computed(() => selectedItems.value.length)

const selectedTotal = computed(() => {
  if (!selectedItems.value || selectedItems.value.length === 0) return 0
  return selectedItems.value.reduce((sum, item) => {
    const price = Number(item.price) || 0
    const qty = Number(item.qty) || 0
    return sum + (price * qty)
  }, 0)
})

// 運費狀態
const state = reactive({ 
  shipping: 0 
})

// TODO: 運費邏輯
function calculateShipping() {
  state.shipping = selectedItems.value && selectedItems.value.length > 0 ? 100 : 0
}

// 監聽選中項目變化以更新運費
watch(selectedItems, () => {
  calculateShipping()
}, { deep: true })

// 開發階段種子資料
onMounted(() => {
  if (!cart.items.length) {
    testItems.forEach(item => cart.add(item))
  }
})

function updateQty(id, qty) {
  cart.updateQty(id, qty)
}

function remove(id) {
  cart.remove(id)
  selectedItems.value = selectedItems.value.filter(item => item.id !== id)
}

const formatCurrency = (value) =>
  new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)

const { shipping } = toRefs(state)

// 全選
function toggleSelectAll(event) {
  const isChecked = event.target.checked
  if (isChecked) {
    selectedItems.value = [...cart.items]
  } else {
    selectedItems.value = []
  }
  calculateShipping()
}

// 單選
function toggleSelectItem(item, event) {
  const isChecked = event.target.checked
  if (isChecked) {
    if (!selectedItems.value.find(i => i.id === item.id)) {
      selectedItems.value = [...selectedItems.value, item]
    }
  } else {
    selectedItems.value = selectedItems.value.filter(i => i.id !== item.id)
  }
  calculateShipping()
}
</script>

<style scoped>
.bg-gray-100 {
  background-color: #f7fafc;
}
.text-black {
  color: #2d3748;
}

/* 隐藏原生checkbox，使用自定义外观 */
input[type="checkbox"].custom-checkbox {
  appearance: none;
  -webkit-appearance: none;
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid #cbd5e1;
  border-radius: 0.25rem;
  background: #fff;
  cursor: pointer;
  position: relative;
  transition: border-color 0.2s, background 0.2s;
}
input[type="checkbox"].custom-checkbox:checked {
  background: #38bdf8; /* sky-400，可自定 */
  border-color: #38bdf8;
}
input[type="checkbox"].custom-checkbox:checked::after {
  content: '';
  position: absolute;
  left: 0.35rem;
  top: 0.10rem;
  width: 0.4rem;
  height: 0.8rem;
  border: solid #fff;
  border-width: 0 0.2rem 0.2rem 0;
  transform: rotate(45deg);
}
</style>
