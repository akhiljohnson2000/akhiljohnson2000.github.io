<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
import Hero from '@/components/Hero.vue'
import About from '@/components/About.vue'
import Experience from '@/components/Experience.vue'
import Projects from '@/components/Projects.vue'
import Skills from '@/components/Skills.vue'
import Toast from '@/components/ui/Toast.vue'
</script>

<template>
  <div class="min-h-screen bg-background">
    <Navbar />
    <main>
      <Hero />
      <About />
      <Experience />
      <Projects />
      <Skills />
    </main>
    <Toast />
  </div>
</template>
