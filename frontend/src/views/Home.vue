<template>
  <div>
    <BannerCarousel />

    <div class="grid grid-cols-2 md:grid-cols-4 gap-6 p-6">
      <RouterLink
        v-for="item in products"
        :key="item.id"
        :to="`/products/${item.id}`"
        class="block"
      >
        <ProductCard :product="item" />
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import BannerCarousel from '@/components/BannerCarousel.vue'
import ProductCard from '@/components/ProductCard.vue'

const products = ref([
  {
    id: 1,
    name: 'BP景品 地獄放館 MONITOR TOP公仔',
    image: '/img/p1.jpg',
    price: 580
  },
  {
    id: 2,
    name: 'TAITO 景品 出包王女 Aqua Float Girls',
    image: '/img/p2.jpg',
    price: 640
  },
  {
    id: 3,
    name: 'GSC 黏土人 鏡音鈴 冬裝特典版',
    image: '/img/p3.jpg',
    price: 1200
  },
  {
    id: 4,
    name: 'PRIME 1 STUDIO Masterline 鋼鐵人',
    image: '/img/p4.jpg',
    price: 19800
  },
  {
    id: 5,
    name: 'PRIME 1 STUDIO Masterline 鋼鐵人',
    image: '/img/p4.jpg',
    price: 19800
  }
])
</script>
