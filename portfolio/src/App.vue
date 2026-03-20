<script setup lang="ts">
import { RouterView } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import Toast from '@/components/ui/Toast.vue'
</script>

<template>
  <div class="min-h-screen bg-background">
    <Navbar />
    <RouterView />
    <Toast />
  </div>
</template>
