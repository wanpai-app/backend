<template>
  <h2 class="mb-4 text-2xl">商品</h2>
  <CommonTable
    :tabs="productTabs"
    :columns="productColumns"
    :value="productValue"
    :scrollable
    :selectable
    :scroll-height
  />
</template>
<script setup>
import { ref } from 'vue'
import CommonTable from '../../components/CommonTable.vue'
import { fetchAllProducts } from '@/api/admin/product'
import { onMounted } from 'vue'
const productTabs = ref([
  // content會依照 commonTable 切到哪個 Tab來顯示，這部分尚未實作
  { title: '全部', content: 'Tab 1 Content', value: 'all' },
  { title: '上架中', content: 'Tab 1 Content', value: 'active' },
  { title: '草稿', content: 'Tab 2 Content', value: 'draft' },
  { title: '典藏', content: 'Tab 3 Content', value: 'archived' },
])
const productColumns = ref([
  { field: 'name', header: '商品', style: 'width: 25%' },
  { field: 'status', header: '狀態', style: 'width: 25%' },
  { field: 'currentStock', header: '庫存數量', style: 'width: 25%' },
])

const productValue = ref([])
onMounted(async () => {
  const res = await fetchAllProducts()
  productValue.value = res
})
</script>
