<template>
    <div class="flex items-center border-b pb-4">
      <img
        v-if="item.image"
        :src="item.image"
        alt="商品圖片"
        class="w-16 h-16 object-cover rounded mr-4"
      />
      <div class="flex-1">
        <p class="font-medium text-gray-800 dark:text-gray-200">{{ item.title }}</p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          單價：{{ formatCurrency(item.price) }}
        </p>
        <div class="mt-2 flex items-center space-x-2">
          <input
            type="number"
            v-model.number="qty"
            @change="onQtyChange"
            class="w-16 border rounded p-1 dark:bg-gray-700 dark:border-gray-600"
            min="1"
          />
          <button
            @click="$emit('remove')"
            class="text-red-500 hover:text-red-700"
          >
            移除
          </button>
        </div>
      </div>
      <div class="w-24 text-right font-medium text-gray-800 dark:text-gray-200">
        {{ formatCurrency(item.price * item.qty) }}
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
  
  const props = defineProps({
    item: {
      type: Object,
      required: true,
      // 預期結構: { id, title, price, qty, image }
    }
  })
  
  // 定義 emit 事件
  const emit = defineEmits(['update', 'remove'])
  
  // 綁定qty同步 props.item.qty
  const qty = ref(props.item.qty)
  watch(
    () => props.item.qty,
    (newQty) => (qty.value = newQty)
  )
  
  // 當輸入框變動時觸發，並保證最少為 1
  function onQtyChange() {
    const normalized = qty.value < 1 ? 1 : qty.value
    emit('update', normalized)
  }
  
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD'
    }).format(value)
  }
  </script>
  
  <style scoped>
  </style>