<script setup lang="ts">
import { RouterLink } from 'vue-router'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import { ArrowRight, FileText, ListChecks } from 'lucide-vue-next'

const services = [
  {
    to: '/learn',
    title: 'Senior Front End JavaScript developer checklist',
    description:
      'Expandable topics, subtopics, and references — a structured path for leveling up as a senior frontend engineer.',
    icon: ListChecks,
  },
  {
    to: '/generate-cv',
    title: 'Resume Generator',
    description:
      'Edit structured JSON, preview a print-ready resume layout, and export to PDF.',
    icon: FileText,
  },
] as const
</script>

<template>
  <main class="pt-24 pb-16">
    <section class="section-alt min-h-[calc(100vh-6rem)]">
      <div class="container mx-auto px-4">
        <div class="max-w-5xl mx-auto">
          <h1 class="text-3xl md:text-4xl font-bold tracking-tight mb-2">Services</h1>
          <p class="text-muted-foreground text-sm md:text-base mb-10 md:mb-12 max-w-2xl">
            Tools and guides for your frontend career — pick a service below.
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <RouterLink
              v-for="item in services"
              :key="item.to"
              :to="item.to"
              class="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Card
                class="h-full min-h-[220px] md:min-h-[280px] border-2 border-border/80 bg-card/80 transition-all duration-200 hover:border-primary/60 hover:shadow-lg hover:bg-accent/30"
              >
                <CardContent class="p-8 md:p-10 h-full flex flex-col justify-between gap-6">
                  <div>
                    <div
                      class="inline-flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6 group-hover:bg-primary/15 transition-colors"
                    >
                      <component :is="item.icon" class="h-7 w-7 md:h-8 md:w-8" aria-hidden="true" />
                    </div>
                    <h2
                      class="text-xl md:text-2xl lg:text-[1.65rem] font-bold tracking-tight leading-snug text-foreground group-hover:text-primary transition-colors"
                    >
                      {{ item.title }}
                    </h2>
                    <p class="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed">
                      {{ item.description }}
                    </p>
                  </div>
                  <div
                    class="flex items-center gap-2 text-sm font-medium text-primary opacity-90 group-hover:opacity-100"
                  >
                    Open
                    <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </RouterLink>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
