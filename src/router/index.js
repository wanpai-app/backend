import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
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
  ],
})

export default router
