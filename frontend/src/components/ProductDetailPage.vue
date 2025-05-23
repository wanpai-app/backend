<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'

const route = useRoute()
const product = ref({})

onMounted(async () => {
  const id = route.params.id
  const res = await axios.get(`/api/products/${id}`)
  product.value = res.data
})

// function addToCart(id) {
//   // 呼叫購物車 API
// }

// function toggleFavorite(id) {
//   // 呼叫收藏/取消收藏 API
// }
</script>

<template>
  <div class="p-6">
    <img :src="product.image" class="w-64 h-64 object-cover rounded" />
    <h1 class="text-2xl font-bold mt-4">{{ product.name }}</h1>
    <p class="text-gray-500">{{ product.description }}</p>
    <div class="text-xl mt-2">
      <span v-if="product.discountPrice" class="text-red-500 mr-2">${{ product.discountPrice }}</span>
      <span :class="{ 'line-through': product.discountPrice }">${{ product.price }}</span>
    </div>
    <div class="mt-4 flex gap-2">
      <button class="bg-blue-500 text-white px-4 py-2 rounded"  @click="addToCart(product.id)">加入購物車</button>
      <button class="bg-pink-500 text-white px-4 py-2 rounded"  @click="toggleFavorite(product.id)">
        {{ product.isFavorited ? '取消收藏' : '收藏' }}
      </button>
    </div>
  </div>
</template>
