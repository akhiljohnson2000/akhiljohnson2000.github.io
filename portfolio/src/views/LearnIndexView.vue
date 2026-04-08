<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { BookOpen, Search } from 'lucide-vue-next'

import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Input from '@/components/ui/Input.vue'

import { filterModuleTiles, getModuleTiles } from '@/lib/learn-data'

const searchQuery = ref('')
const allTiles = getModuleTiles()

const filteredTiles = computed(() => filterModuleTiles(allTiles, searchQuery.value))
</script>

<template>
  <main class="pt-16">
    <section class="section-alt">
      <div class="container mx-auto px-4">
        <div class="max-w-5xl mx-auto">
      

          <div class="relative mb-4 md:mb-4 max-w-xl">
            <Search
              class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              v-model="searchQuery"
              type="search"
              name="learn-search"
              placeholder="Search topics, subtopics, modules…"
              class="h-11 pl-9"
              autocomplete="off"
              aria-label="Search learning modules and topics"
            />
          </div>

          <p
            v-if="filteredTiles.length === 0"
            class="text-muted-foreground text-sm md:text-base py-8 text-center"
          >
            No modules match “{{ searchQuery.trim() }}”. Try another search.
          </p>

          <div
            v-else
            class="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5"
          >
            <RouterLink
              v-for="tile in filteredTiles"
              :key="tile.id"
              :to="{ name: 'LearnModule', params: { slug: tile.id } }"
              class="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Card class="h-full transition-shadow group-hover:shadow-md border-border/80">
                <CardContent class="p-5 md:p-6 flex gap-4">
                  <div
                    class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-500/15 text-pink-600 dark:text-pink-400 group-hover:bg-pink-500/20 transition-colors"
                  >
                    <BookOpen class="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <h2
                      class="text-sm md:text-base font-semibold font-mono tracking-tight text-foreground break-all group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors"
                    >
                      {{ tile.fileName }}
                    </h2>
                    <p class="mt-2 text-sm md:text-base text-muted-foreground leading-snug">
                      {{ tile.title }}
                    </p>
                    <p class="mt-1.5 text-xs text-muted-foreground">
                      {{ tile.topicCount }} table row{{ tile.topicCount === 1 ? '' : 's' }}
                    </p>
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
