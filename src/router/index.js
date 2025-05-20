import { createRouter, createWebHistory } from 'vue-router'

import ProductDetailPage from '../components/ProductDetailPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/Admin/AdminHome.vue'),
      children: [
        {
          path: 'products',
          name: 'products',
          component: () => import('../views/Admin/AdminProducts.vue'),
        },
        {
          path: 'orders',
          name: 'orders',
          component: () => import('../views/Admin/AdminOrders.vue'),
        },
        {
          path: 'inventory',
          name: 'inventory',
          component: () => import('../views/Admin/AdminInventory.vue'),
        },
      ],
    },
        {
          path: '/productdetailpage',
          name: 'productdetailpage',
          component: ProductDetailPage,
        }
  ],
})

export default router
