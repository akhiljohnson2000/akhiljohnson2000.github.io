<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import Toast from '@/components/ui/Toast.vue'

const route = useRoute()
const showNavbar = computed(() => route.name !== 'ResumeGenerator')
</script>

<template>
  <div class="min-h-screen bg-background">
    <Navbar v-if="showNavbar" />
    <RouterView />
    <Toast />
  </div>
</template>
