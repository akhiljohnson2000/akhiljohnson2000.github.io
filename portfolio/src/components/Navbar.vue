<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Button from '@/components/ui/Button.vue'
import ModeToggle from '@/components/ModeToggle.vue'
import { Menu, X } from 'lucide-vue-next'

const isScrolled = ref(false)
const isMenuOpen = ref(false)

const navLinks = [
  { name: 'About', href: '#about' },
  { name: 'Experience', href: '#experience' },
  { name: 'Projects', href: '#projects' },
  { name: 'Skills', href: '#skills' },
  { name: 'Contact', href: '#contact' },
]

function handleScroll() {
  isScrolled.value = window.scrollY > 10
}

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <header
    :class="[
      'fixed top-0 w-full z-50 transition-all duration-200 ease-out',
      isScrolled ? 'bg-background/90 backdrop-blur-md border-b border-border/50' : 'bg-transparent',
    ]"
  >
    <div class="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
      <a href="/" class="text-xl font-bold tracking-tight hover:opacity-90 transition-opacity duration-200">
        Akhil<span class="text-primary">Johnson</span>
      </a>

      <nav class="hidden md:flex items-center gap-6">
        <a
          v-for="link in navLinks"
          :key="link.name"
          :href="link.href"
          class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
        >
          {{ link.name }}
        </a>
        <ModeToggle />
        <Button as="a" href="/akhil_johnson_cv.pdf" target="_blank" rel="noopener noreferrer">
          Resume
        </Button>
      </nav>

      <div class="flex items-center space-x-4 md:hidden">
        <ModeToggle />
        <Button variant="ghost" size="icon" @click="toggleMenu">
          <X v-if="isMenuOpen" class="h-6 w-6" />
          <Menu v-else class="h-6 w-6" />
        </Button>
      </div>
    </div>

    <div v-show="isMenuOpen" class="md:hidden bg-background border-t">
      <div class="container mx-auto px-4 py-4 flex flex-col space-y-4">
        <a
          v-for="link in navLinks"
          :key="link.name"
          :href="link.href"
          class="text-sm font-medium py-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
          @click="toggleMenu"
        >
          {{ link.name }}
        </a>
        <Button as="a" href="/akhil_johnson_cv.pdf" target="_blank" rel="noopener noreferrer" class="w-full">
          Resume
        </Button>
      </div>
    </div>
  </header>
</template>
