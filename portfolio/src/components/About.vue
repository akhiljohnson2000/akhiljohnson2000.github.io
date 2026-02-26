<script setup lang="ts">
import { MapPin } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
</script>

<template>
  <section id="about" class="py-20 bg-muted/30">
    <div class="container mx-auto px-4">
      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }"
        class="max-w-3xl mx-auto"
      >
        <h2 class="text-3xl font-bold text-center mb-12">About Me</h2>

        <Card>
          <CardContent class="p-6">
            <div class="flex items-center mb-4">
              <div class="flex items-center text-muted-foreground">
                <MapPin class="h-4 w-4 mr-2" />
                <span>Thrissur, Kerala, India</span>
              </div>
            </div>

            <p class="mb-4">
              I'm a front-end developer with proven experience at Cakap and Qburst in helping them create and maintain
              a better code base for reusability. Passionate about learning and development with a desire to apply
              skills.
            </p>

            <p class="mb-4">
              With over 7 years of experience in Angular and 5 years in React, I've developed a strong foundation in
              building responsive, user-friendly web applications that deliver exceptional user experiences.
            </p>

            <p>
              I'm eager to tackle more complex problems and continue to find ways to maximize user efficiency. My
              expertise includes developing dashboards, RTC interfaces for video and audio conversations, and
              real-time chat services for interaction between users.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
</template>
