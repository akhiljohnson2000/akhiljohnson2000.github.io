<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
import Hero from '@/components/Hero.vue'
import About from '@/components/About.vue'
import Experience from '@/components/Experience.vue'
import Projects from '@/components/Projects.vue'
import Skills from '@/components/Skills.vue'
import Services from '@/components/Services.vue'
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
      <Services />
    </main>
    <Toast />
  </div>
</template>
