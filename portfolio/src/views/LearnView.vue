<script setup lang="ts">
import { computed, ref } from 'vue'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardContent from '@/components/ui/CardContent.vue'

type ChecklistFile = {
  title?: string
  topics?: Array<{
    name?: string
    subtopics?: unknown[]
    references?: unknown[]
    [key: string]: unknown
  }>
}

type CombinedChecklistFile = {
  modules?: Array<{
    order?: number
    title?: string
    topics?: ChecklistFile['topics']
  }>
}

// Load the single combined file only.
const combinedModules = import.meta.glob('../learn/frontend-checklist/all-checklists.json', { eager: true }) as Record<
  string,
  { default?: CombinedChecklistFile }
>

const topics = computed(() => {
  const combined = Object.values(combinedModules)[0]?.default
  const modules = combined?.modules ?? []

  return [...modules]
    .sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER))
    .map((m) => {
      const order = m.order ?? Number.MAX_SAFE_INTEGER
      const title = m.title ?? 'Untitled'
      const items = Array.isArray(m.topics) ? m.topics : []
      return {
        key: `${order}-${title}`,
        title,
        items,
        order,
      }
    })
})

const expanded = ref<Record<string, boolean>>({})

function toggleTopic(key: string) {
  expanded.value[key] = !expanded.value[key]
}

function handleToggleKeydown(e: KeyboardEvent, key: string) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    toggleTopic(key)
  }
}
</script>

<template>
  <main class="pt-24">
      <section class="section-alt">
        <div class="container mx-auto px-4">
          <div class="max-w-4xl mx-auto">
            <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3 leading-tight">
              Senior Front End JavaScript developer checklist
            </h1>
            <p class="text-muted-foreground text-sm md:text-base mb-8 md:mb-10 max-w-3xl">
              Click a topic to expand. Each module lists subtopics and references to study in depth.
            </p>

            <div class="space-y-4">
              <!-- <div class="flex items-start justify-between gap-4">
                <Card class="flex-1">
                  <CardHeader>
                    <CardTitle>Frontend Checklist</CardTitle>
                    <CardDescription>
                      Click expand to view each topic’s checklist.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div> -->

              <Card v-for="topic in topics" :key="topic.key">
                <CardHeader @click="toggleTopic(topic.key)" class="cursor-pointer">
                  <div
                    class="flex items-center justify-between gap-4 select-none"
                    role="button"
                    tabindex="0"
                    :aria-expanded="expanded[topic.key] ? 'true' : 'false'"
                    @keydown="(e) => handleToggleKeydown(e as KeyboardEvent, topic.key)"
                  >
                    <div class="min-w-0">
                      <CardTitle>
                        {{ String(topic.order).padStart(2, '0') }} - {{ topic.title }}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>

                <CardContent v-if="expanded[topic.key]">
                  <div v-if="topic.items.length === 0" class="text-muted-foreground text-[15px] md:text-[20px]">
                    No topics yet.
                  </div>
                  <div v-else>
                    <table class="w-full table-fixed border border-border/60">
                      <thead class="bg-muted/30">
                        <tr>
                          <th class="w-[30%] text-left px-3 py-2 text-sm font-semibold text-muted-foreground border-b border-border/60">
                            Topic
                          </th>
                          <th class="w-[70%] text-left px-3 py-2 text-sm font-semibold text-muted-foreground border-b border-border/60">
                            Subtopics & References
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(t, idx) in topic.items"
                          :key="idx"
                          class="border-b border-border/60 last:border-b-0"
                        >
                          <td class="px-3 py-2 align-top text-[15px] md:text-[20px] font-medium whitespace-normal break-words">
                            {{ t.name ?? 'Untitled' }}
                          </td>
                          <td class="px-3 py-2 align-top whitespace-normal break-words">
                            <div v-if="Array.isArray(t.subtopics) && t.subtopics.length">
                              <!-- <div class="text-xs font-semibold text-muted-foreground mb-1">Subtopics</div> -->
                              <ul class="list-disc pl-5 space-y-1">
                                <li
                                  v-for="(st, sidx) in t.subtopics"
                                  :key="sidx"
                                  class="text-[15px] md:text-[20px] text-foreground/90 whitespace-normal break-words break-all"
                                >
                                  {{ typeof st === 'string' ? st : JSON.stringify(st) }}
                                </li>
                              </ul>
                            </div>
                            <div v-else class="text-muted-foreground text-[15px] md:text-[20px] mb-1">Subtopics: -</div>

                            <div v-if="Array.isArray(t.references) && t.references.length" class="mt-3">
                              <div class="text-xs font-semibold text-muted-foreground mb-1">References</div>
                              <ul class="list-disc pl-5 space-y-1">
                                <li
                                  v-for="(r, ridx) in t.references"
                                  :key="ridx"
                                  class="text-[15px] md:text-[20px] text-foreground/90 whitespace-normal break-words break-all"
                                >
                                  {{ typeof r === 'string' ? r : JSON.stringify(r) }}
                                </li>
                              </ul>
                            </div>
                            <!-- <div v-else class="text-muted-foreground text-[15px] md:text-[20px] mt-1">References: -</div> -->
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </main>
</template>
