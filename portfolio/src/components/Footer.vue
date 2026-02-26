<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="py-8 border-t border-border/50">
    <div class="container mx-auto px-4">
      <div class="flex flex-col md:flex-row justify-between items-center gap-4">
        <p class="text-sm text-muted-foreground">© {{ currentYear }} Akhil Johnson. All rights reserved.</p>
        <p class="text-sm text-muted-foreground">Built with Vue.js & Tailwind CSS</p>
      </div>
    </div>
  </footer>
</template>
