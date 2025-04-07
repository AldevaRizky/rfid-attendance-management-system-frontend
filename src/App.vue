<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <main class="app-wrapper">
    <RouterView />
  </main>
</template>

<style scoped>
.app-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f0f2f5;
  padding: 0;
  margin: 0;
}
</style>
