<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="py-8 border-t">
    <div class="container mx-auto px-4">
      <div class="flex flex-col md:flex-row justify-between items-center">
        <div class="mb-4 md:mb-0">
          <p class="text-sm text-muted-foreground">© {{ currentYear }} Akhil Johnson. All rights reserved.</p>
        </div>
        <div>
          <p class="text-sm text-muted-foreground">Built with Vue.js and Tailwind CSS</p>
        </div>
      </div>
    </div>
  </footer>
</template>
