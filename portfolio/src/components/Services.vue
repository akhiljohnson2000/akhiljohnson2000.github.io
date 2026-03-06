<script setup lang="ts">
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardDescription from '@/components/ui/CardDescription.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Button from '@/components/ui/Button.vue'
import { RouterLink } from 'vue-router'
</script>

<template>
  <section id="services" class="section-alt">
    <div class="container mx-auto px-4">
      <div
        v-motion
        :initial="{ opacity: 0, y: 12 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }"
        class="max-w-4xl mx-auto"
      >
        <h2 class="section-heading">Services</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card class="transition-shadow duration-300 hover:shadow-md">
            <CardHeader>
              <CardTitle>News</CardTitle>
              <CardDescription>Browse and filter live news.</CardDescription>
            </CardHeader>
            <CardContent class="flex items-center justify-between gap-4">
              <p class="text-sm text-muted-foreground">
                Powered by NewsAPI. Search, sort, and filter results.
              </p>
              <Button as-child>
                <RouterLink to="/services/news">Open</RouterLink>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </section>
</template>
