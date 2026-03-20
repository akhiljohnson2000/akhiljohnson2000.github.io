<script setup lang="ts">
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Badge from '@/components/ui/Badge.vue'

const skillCategories = [
  {
    title: 'Frontend Frameworks',
    items: ['React', 'Next.js (SSR, SEO optimization)', 'Angular'],
  },
  {
    title: 'State Management & Architecture',
    items: ['Redux', 'Context API', 'RxJS', 'NgRx', 'Component-driven design'],
  },
  {
    title: 'Performance & Optimization',
    items: ['Code splitting', 'Lazy loading', 'Memoization', 'Web Vitals', 'Lighthouse', 'Chrome DevTools'],
  },
  {
    title: 'Accessibility & SEO',
    items: ['WCAG', 'ARIA', 'Semantic HTML', 'SSR', 'Metadata optimization'],
  },
  {
    title: 'Testing & Tooling',
    items: ['Jest', 'Karma', 'Jasmine', 'Webpack', 'NPM'],
  },
  {
    title: 'APIs & Auth',
    items: ['REST APIs', 'JWT-based authentication'],
  },
  {
    title: 'Dev Practices',
    items: ['Agile (Scrum, Kanban)', 'Git', 'Code reviews', 'Documentation'],
  },
  {
    title: 'Languages',
    items: ['English', 'Hindi', 'Malayalam'],
  },
  {
    title: 'Key Strengths',
    items: [
      'Senior-level ownership of frontend systems',
      'React-first mindset with strong Angular background',
      'Performance, scalability, and SEO focus',
      'Mentorship and leadership experience',
      'Proven ability to work in remote, cross-functional teams',
    ],
  },
]
</script>

<template>
  <div class="pt-24">
    <section id="skills" class="section">
      <div class="container mx-auto px-4">
      <div
        v-motion
        :initial="{ opacity: 0, y: 12 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }"
      >
        <h2 class="section-heading">Skills & Competencies</h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div
            v-for="(category, index) in skillCategories"
            :key="category.title"
            v-motion
            :initial="{ opacity: 0, y: 12 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 0.32, delay: index * 50, ease: 'easeOut' } }"
          >
            <Card class="h-full transition-shadow duration-300 hover:shadow-md">
              <CardContent class="p-5">
                <h3 class="font-semibold text-foreground text-sm uppercase tracking-wide text-muted-foreground mb-3">
                  {{ category.title }}
                </h3>
                <div class="flex flex-wrap gap-1.5">
                  <Badge
                    v-for="(item, i) in category.items"
                    :key="i"
                    variant="secondary"
                    class="text-xs font-normal"
                  >
                    {{ item }}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </section>
  </div>
</template>
