<script setup lang="ts">
import Button from '@/components/ui/Button.vue'
import { ArrowDown, Github, Linkedin, Mail } from 'lucide-vue-next'
</script>

<template>
  <section class="relative min-h-screen flex items-center justify-center overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-b from-primary/5 to-background/20 dark:from-primary/10 dark:to-background/30 z-0" />

    <div class="container mx-auto px-4 z-10">
      <div
        v-motion
        :initial="{ opacity: 0, y: 12 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }"
        class="max-w-3xl mx-auto text-center"
      >
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
          Hi, I'm <span class="text-primary">Akhil Johnson</span>
        </h1>
        <h2 class="text-xl md:text-2xl font-medium text-muted-foreground mb-6">
          Expert Angular and React Developer
        </h2>
        <p class="text-lg text-muted-foreground/90 mb-8 leading-relaxed">
          Senior Frontend Engineer with 8+ years of experience building high-performance, scalable web applications.
          Currently working as Senior Software Engineer at Clockhash. Focus on React, Next.js, Angular, performance,
          accessibility, and design systems.
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
          <Button as="a" href="#projects" size="lg" class="transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]">
            View My Work
          </Button>
          <Button as="a" href="#contact" variant="outline" size="lg" class="transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]">
            Contact Me
          </Button>
        </div>

        <div class="flex items-center justify-center gap-4">
          <a
            href="https://github.com/akhiljohnson2000"
            target="_blank"
            rel="noopener noreferrer"
            class="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-200"
            aria-label="GitHub"
          >
            <Github class="h-5 w-5" />
          </a>
          <a
            href="https://linkedin.com/in/akhiljohnson2000"
            target="_blank"
            rel="noopener noreferrer"
            class="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-200"
            aria-label="LinkedIn"
          >
            <Linkedin class="h-5 w-5" />
          </a>
          <a
            href="mailto:akhiljohnson2000@gmail.com"
            class="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-200"
            aria-label="Email"
          >
            <Mail class="h-5 w-5" />
          </a>
        </div>
      </div>
    </div>

    <a
      href="#about"
      class="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-200 animate-bounce"
      aria-label="Scroll down"
    >
      <ArrowDown class="h-6 w-6" />
    </a>
  </section>
</template>
