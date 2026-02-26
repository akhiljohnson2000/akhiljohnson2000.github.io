<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="py-8 border-t border-border/50">
    <div class="container mx-auto px-4 text-center">
      <p class="text-sm text-muted-foreground">© {{ currentYear }} Akhil Johnson. All rights reserved.</p>
    </div>
  </footer>
</template>
