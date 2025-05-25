<template>
  <nav class="p-4 bg-gray-100 mb-4">
    <RouterLink to="/admin" class="mr-4">後台首頁</RouterLink>
    <RouterLink to="/">首頁</RouterLink>
    <RouterLink to="/productdetailpage" class="ml-4">Product</RouterLink>
  </nav>

  <RouterView /> <!-- 每個頁面內容都會出現在這 -->
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>