<script setup lang="ts">
import { computed, ref } from 'vue'
import Navbar from '@/components/Navbar.vue'
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

// Loads every JSON checklist file under `src/learn/frontend-checklist/`
const modules = import.meta.glob('../learn/frontend-checklist/*.json', { eager: true }) as Record<
  string,
  { default?: ChecklistFile }
>

function extractOrder(filePath: string) {
  // filenames are prefixed like `01-html.json`, `02-css.json`, etc.
  const match = filePath.match(/\/(\d+)-[^/]+\.json$/)
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER
}

const topics = computed(() => {
  const entries = Object.entries(modules)
  return entries
    .map(([path, mod]) => {
      const data = mod.default ?? {}
      const title = data.title ?? path.split('/').pop()?.replace(/^\d+-/, '').replace(/\.json$/, '') ?? 'Untitled'
      // JSON structure uses `topics[]` (each has `name`, `subtopics[]`, `references[]`)
      const items = Array.isArray(data.topics) ? data.topics : []
      const order = extractOrder(path)
      return {
        key: path,
        title,
        items,
        order,
      }
    })
    .sort((a, b) => a.order - b.order)
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
  <div class="min-h-screen bg-background">
    <Navbar />
    <main class="pt-24">
      <section class="section-alt">
        <div class="container mx-auto px-4">
          <div class="max-w-4xl mx-auto">
            <!-- <h1 class="text-3xl md:text-4xl font-bold tracking-tight mb-8">Learn</h1> -->

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
                    class="flex items-center justify-between gap-4select-none"
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
                  <div v-if="topic.items.length === 0" class="text-muted-foreground text-sm">
                    No topics yet.
                  </div>
                  <div v-else class="overflow-x-auto">
                    <table class="w-full table-auto border border-border/60">
                      <thead class="bg-muted/30">
                        <tr>
                          <th class="text-left px-3 py-2 text-xs font-semibold text-muted-foreground border-b border-border/60">
                            Topic
                          </th>
                          <th class="text-left px-3 py-2 text-xs font-semibold text-muted-foreground border-b border-border/60">
                            Subtopics
                          </th>
                          <th class="text-left px-3 py-2 text-xs font-semibold text-muted-foreground border-b border-border/60">
                            References
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(t, idx) in topic.items"
                          :key="idx"
                          class="border-b border-border/60 last:border-b-0"
                        >
                          <td class="px-3 py-2 align-top text-sm font-medium">
                            {{ t.name ?? 'Untitled' }}
                          </td>
                          <td class="px-3 py-2 align-top">
                            <ul v-if="Array.isArray(t.subtopics) && t.subtopics.length" class="list-disc pl-5 space-y-1">
                              <li
                                v-for="(st, sidx) in t.subtopics"
                                :key="sidx"
                                class="text-sm text-foreground/90"
                              >
                                {{ typeof st === 'string' ? st : JSON.stringify(st) }}
                              </li>
                            </ul>
                            <div v-else class="text-muted-foreground text-sm">-</div>
                          </td>
                          <td class="px-3 py-2 align-top">
                            <ul v-if="Array.isArray(t.references) && t.references.length" class="list-disc pl-5 space-y-1">
                              <li
                                v-for="(r, ridx) in t.references"
                                :key="ridx"
                                class="text-sm text-foreground/90"
                              >
                                {{ typeof r === 'string' ? r : JSON.stringify(r) }}
                              </li>
                            </ul>
                            <div v-else class="text-muted-foreground text-sm">-</div>
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
  </div>
</template>
