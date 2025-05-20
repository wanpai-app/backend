<template>
  <div class="max-w-5xl mx-auto p-4 space-y-8">
    <!-- 商品區塊 -->
    <Card>
      <template #title>{{ product.name }}</template>
      <template #subtitle>
        <div class="text-sm text-gray-500">
          {{ product.isPreorder ? '預購中 - 預計到貨 ' + product.arrivalDate : '現貨供應' }}
        </div>
      </template>
      <template #content>
        <img :src="product.imageUrl" alt="" class="w-full max-w-md mb-4" />
        <p class="mb-2 text-xl font-bold text-red-500">NT$ {{ product.price }}</p>

        <!-- 數量選擇 -->
        <div class="flex items-center space-x-2">
          <label>數量：</label>
          <InputNumber v-model="quantity" :min="1" />
        </div>

        <!-- 加入購物車 & 立即購買 -->
        <div class="mt-4 space-x-2">
          <Button label="加入購物車" icon="pi pi-shopping-cart" @click="addToCart" />
          <Button label="立即購買" severity="danger" @click="buyNow" />
        </div>

        <!-- 收藏 -->
        <div class="mt-2">
          <ToggleButton
            v-model="isFavorited"
            onLabel="已收藏"
            offLabel="收藏"
            iconPos="left"
            :onIcon="'pi pi-heart-fill'"
            :offIcon="'pi pi-heart'"
            @change="toggleFavorite"
          />
        </div>
      </template>
    </Card>

    <!-- 加購商品區 -->
    <Card>
      <template #title>優惠加購</template>
      <template #content>
        <div v-for="item in addOns" :key="item.id" class="flex items-center space-x-2 mb-2">
          <Checkbox v-model="selectedAddOns" :value="item.id" />
          <span>{{ item.name }} - NT$ {{ item.price }}</span>
        </div>
        <Button label="一起加入購物車" @click="addAddOnsToCart" />
      </template>
    </Card>

    <!-- 分享商品 -->
    <div class="flex items-center space-x-2">
      <Button label="分享商品" icon="pi pi-share-alt" @click="shareProduct" />
    </div>

    <!-- 推薦商品 Carousel -->
    <div>
      <h3 class="text-xl font-semibold mb-2">你可能會喜歡</h3>
      <Carousel :value="recommendations" :numVisible="3" :numScroll="1">
        <template #item="{ data }">
          <Card>
            <template #title>{{ data.name }}</template>
            <template #content>
              <img :src="data.imageUrl" class="w-full h-40 object-cover" />
              <p class="text-red-500 mt-2">NT$ {{ data.price }}</p>
            </template>
            <template #footer>
              <Button label="查看" @click="goToProduct(data.id)" />
            </template>
          </Card>
        </template>
      </Carousel>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useFavoriteStore } from '@/stores/favorite'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const productId = route.params.id

const product = ref({})
const quantity = ref(1)
const isFavorited = ref(false)
const addOns = ref([])
const selectedAddOns = ref([])
const recommendations = ref([])

const cart = useCartStore()
const favorite = useFavoriteStore()

onMounted(async () => {
  const { data } = await axios.get(`/api/products/${productId}`)
  product.value = data
  isFavorited.value = await favorite.check(productId)
  addOns.value = data.addOns
  const rec = await axios.get(`/api/products/${productId}/recommendations`)
  recommendations.value = rec.data
})

const addToCart = () => {
  cart.add(product.value.id, quantity.value)
}

const buyNow = () => {
  cart.add(product.value.id, quantity.value)
  router.push('/checkout')
}

const addAddOnsToCart = () => {
  selectedAddOns.value.forEach(id => {
    cart.add(id, 1)
  })
}

const toggleFavorite = () => {
  if (isFavorited.value) {
    favorite.remove(product.value.id)
  } else {
    favorite.add(product.value.id)
  }
}

const shareProduct = () => {
  if (navigator.share) {
    navigator.share({
      title: product.value.name,
      url: window.location.href
    })
  } else {
    navigator.clipboard.writeText(window.location.href)
    alert('連結已複製！')
  }
}

const goToProduct = id => {
  router.push(`/product/${id}`)
}
</script>