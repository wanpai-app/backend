<template>
  <Carousel
    :value="products"
    :numVisible="4"
    :numScroll="4"
    :responsiveOptions="responsiveOptions"
  >
    <template #item="slotProps">
      <div class="border border-surface-200 dark:border-surface-700 rounded m-2 p-4">
        <div class="mb-4">
          <div class="relative mx-auto">
            <img
              :src="'https://primefaces.org/cdn/primevue/images/product/' + slotProps.data.image"
              :alt="slotProps.data.name"
              class="w-full rounded"
            />
            <Tag
              :value="slotProps.data.inventoryStatus"
              :severity="getSeverity(slotProps.data.inventoryStatus)"
              class="absolute"
              style="left:5px; top: 5px"
            />
          </div>
        </div>
        <div class="mb-4 font-medium">{{ slotProps.data.name }}</div>
        <div class="flex justify-between items-center">
          <div class="mt-0 font-semibold text-xl">${{ slotProps.data.price }}</div>
          <span>
            <Button icon="pi pi-heart" severity="secondary" outlined />
            <Button icon="pi pi-shopping-cart" class="ml-2" />
          </span>
        </div>
      </div>
    </template>
  </Carousel>
</template>

<script setup>
import { ref } from 'vue'
import Carousel from 'primevue/carousel'
import Button from 'primevue/button'
import Tag from 'primevue/tag'

const products = ref([
  {
    name: 'Bamboo Watch',
    image: 'bamboo-watch.jpg',
    price: 65,
    inventoryStatus: 'INSTOCK'
  },
  {
    name: 'Black Watch',
    image: 'black-watch.jpg',
    price: 72,
    inventoryStatus: 'LOWSTOCK'
  },
  {
    name: 'Blue T-Shirt',
    image: 'blue-t-shirt.jpg',
    price: 29,
    inventoryStatus: 'OUTOFSTOCK'
  },
  {
    name: 'Sneakers',
    image: 'sneakers.jpg',
    price: 89,
    inventoryStatus: 'INSTOCK'
  }
])

const responsiveOptions = ref([
  {
    breakpoint: '1024px',
    numVisible: 3,
    numScroll: 3
  },
  {
    breakpoint: '768px',
    numVisible: 2,
    numScroll: 2
  },
  {
    breakpoint: '560px',
    numVisible: 1,
    numScroll: 1
  }
])

const getSeverity = (status) => {
  switch (status) {
    case 'INSTOCK':
      return 'success'
    case 'LOWSTOCK':
      return 'warning'
    case 'OUTOFSTOCK':
      return 'danger'
    default:
      return null
  }
}
</script>
