<template>
  <h2>這是後台首頁</h2>
  <router-view />
  <div class="card flex justify-center">
    <Menu :model="items">
      <template #item="{ item, props }">
        <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
          <a :href="href" v-bind="props.action" @click="navigate">
            <span :class="item.icon" />
            <span class="ml-2">{{ item.label }}</span>
          </a>
        </router-link>
      </template>
    </Menu>
  </div>
</template>

<script setup>
import Menu from '@/volt/Menu.vue'
import { ref } from 'vue'
// import { useRouter } from 'vue-router'

// const router = useRouter()
const items = ref([
  {
    label: '商品列表',
    icon: 'pi pi-palette',
    route: '/admin/products',
  },
  {
    label: '訂單管理',
    icon: 'pi pi-palette',
    route: '/admin/orders',
  },
  {
    label: '庫存管理',
    icon: 'pi pi-palette',
    route: '/admin/inventory',
  },
])
</script>
