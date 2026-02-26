<script setup lang="ts">
import Button from '@/components/ui/Button.vue'
import { ArrowDown, Github, Linkedin, Mail } from 'lucide-vue-next'
</script>

<template>
  <section class="relative h-screen flex items-center justify-center overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-b from-primary/5 to-background/20 dark:from-primary/10 dark:to-background/30 z-0" />

    <div class="container mx-auto px-4 z-10">
      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }"
        class="max-w-3xl mx-auto text-center"
      >
        <h1 class="text-4xl md:text-6xl font-bold mb-4">
          Hi, I'm <span class="text-primary">Akhil Johnson</span>
        </h1>
        <h2 class="text-xl md:text-2xl font-medium text-muted-foreground mb-6">
          Expert Angular and React Developer
        </h2>
        <p class="text-lg mb-8">
          Building Dynamic User Interfaces with 7+ years of experience in frontend development. Currently working as a
          Senior Software Engineer at Cakap.
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Button as="a" href="#projects" size="lg">View My Work</Button>
          <Button as="a" href="#contact" variant="outline" size="lg">Contact Me</Button>
        </div>

        <div class="flex items-center justify-center gap-6">
          <a href="https://github.com/akhiljohnson2000" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon" class="rounded-full">
              <Github class="h-5 w-5" />
              <span class="sr-only">GitHub</span>
            </Button>
          </a>
          <a href="https://linkedin.com/in/akhiljohnson2000" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon" class="rounded-full">
              <Linkedin class="h-5 w-5" />
              <span class="sr-only">LinkedIn</span>
            </Button>
          </a>
          <a href="mailto:akhiljohnson2000@gmail.com">
            <Button variant="ghost" size="icon" class="rounded-full">
              <Mail class="h-5 w-5" />
              <span class="sr-only">Email</span>
            </Button>
          </a>
        </div>
      </div>
    </div>

    <div class="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
      <Button variant="ghost" size="icon" as="a" href="#about">
        <ArrowDown class="h-6 w-6" />
        <span class="sr-only">Scroll Down</span>
      </Button>
    </div>
  </section>
</template>
