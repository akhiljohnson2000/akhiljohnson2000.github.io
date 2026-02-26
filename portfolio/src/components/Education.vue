<script setup lang="ts">
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import { GraduationCap } from 'lucide-vue-next'

const education = [
  {
    institution: 'METS School of Engineering',
    degree: 'B.Tech · 7.5 GPA',
    field: 'Electronics and Communication Engineering',
    period: 'Jun 2013 – May 2017',
  },
  {
    institution: 'St. Sebastian H.S.S, Kuttikad',
    degree: '+2 · 76%',
    field: 'XII Computer Science',
    period: 'Jun 2011 – Mar 2013',
  },
]
</script>

<template>
  <section id="education" class="section-alt">
    <div class="container mx-auto px-4">
      <div
        v-motion
        :initial="{ opacity: 0, y: 12 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }"
      >
        <h2 class="section-heading">Education</h2>

        <div class="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
          <div
            v-for="(edu, index) in education"
            :key="edu.institution"
            v-motion
            :initial="{ opacity: 0, y: 12 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 0.32, delay: index * 80, ease: 'easeOut' } }"
          >
            <Card class="h-full transition-shadow duration-300 hover:shadow-md">
              <CardContent class="p-6">
                <div class="flex items-start gap-3">
                  <div class="rounded-lg bg-primary/10 p-2 shrink-0">
                    <GraduationCap class="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-foreground">{{ edu.institution }}</h3>
                    <p class="text-sm font-medium text-primary mt-0.5">{{ edu.degree }}</p>
                    <p class="text-sm text-muted-foreground mt-1">{{ edu.field }}</p>
                    <p class="text-xs text-muted-foreground/80 mt-2">{{ edu.period }}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
