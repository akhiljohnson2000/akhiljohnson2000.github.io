<script setup lang="ts">
import { MapPin } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
</script>

<template>
  <section id="about" class="section-alt">
    <div class="container mx-auto px-4">
      <div
        v-motion
        :initial="{ opacity: 0, y: 12 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }"
        class="max-w-3xl mx-auto"
      >
        <h2 class="section-heading">About Me</h2>

        <Card class="overflow-hidden transition-shadow duration-300 hover:shadow-md">
          <CardContent class="p-6 md:p-8">
            <div class="flex items-center gap-2 text-muted-foreground mb-6">
              <MapPin class="h-4 w-4 shrink-0" />
              <span>Thrissur, Kerala, India</span>
            </div>

            <p class="mb-4 leading-relaxed text-muted-foreground/90">
              Senior Frontend Engineer with 8+ years of experience building high-performance, scalable web applications
              across education, real-time communication, and data-driven platforms. Strong expertise in React, Next.js,
              and Angular, with focus on component-driven architecture, performance optimization, accessibility
              (WCAG), SEO, and design systems.
            </p>

            <p class="mb-4 leading-relaxed text-muted-foreground/90">
              I own features end-to-end, mentor engineers, and collaborate with product, design, and backend teams to
              deliver production-grade user experiences at scale. My expertise includes dashboards, WebRTC interfaces
              for video and audio, and real-time chat services.
            </p>

            <p class="leading-relaxed text-muted-foreground/90">
              React-first mindset with a strong Angular background; focused on performance, scalability, SEO, and
              proven ability to work in remote, cross-functional teams.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
</template>
