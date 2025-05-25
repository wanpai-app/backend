<template>
  <div class="w-full">
    <Carousel
      :value="banners"
      :numVisible="1"
      :numScroll="1"
      :circular="true"
      :autoplayInterval="3000"
    >
      <template #item="slotProps">
        <div
          class="relative w-full h-[400px] bg-cover bg-center"
          :style="`background-image: url('${slotProps.data.image}')`"
        >
          <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
            <h2 class="text-white text-3xl font-bold text-center">
              {{ slotProps.data.title }}
            </h2>
          </div>
        </div>
      </template>
    </Carousel>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Carousel from 'primevue/carousel'

const banners = ref([
  {
    title: '🔥 限時優惠中！',
    image: '/banner/banner1.jpg'
  },
  {
    title: '新品上架 ✨',
    image: '/banner/banner2.jpg'
  },
  {
    title: '人氣商品大賞 🏆',
    image: '/banner/banner3.jpg'
  }
])
</script>

<style>
/* ✅ 所有指示點 */
.p-carousel-indicator-button {
  background-color: #d1d5db !important; /* Tailwind gray-300 */
  width: 12px !important;
  height: 12px !important;
  border-radius: 9999px !important;
  margin: 0 4px !important;
  opacity: 0.5 !important;
  border: none !important;
  box-shadow: none !important;
}

/* ✅ 當前那一顆指示點 */
.p-carousel-indicator-button[aria-current='page'] {
  background-color: #f59e0b !important; /* amber-500 */
  opacity: 1 !important;
}
</style>
