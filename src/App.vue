<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <nav>
    <RouterLink to="/admin">後台首頁</RouterLink>
    <RouterLink to="/productdetailpage">product</RouterLink>
  </nav>
  <RouterView />
</template>

<style scoped></style>
