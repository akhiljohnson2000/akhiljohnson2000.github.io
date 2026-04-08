<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'

import { getModuleDataBySlug } from '@/lib/learn-data'
import { expandTopicsToRows } from '@/lib/learn-topic-rows'
import type { TopicDisplayRow } from '@/lib/learn-topic-rows'

type GroupedRow = TopicDisplayRow & {
  sectionRowSpan: number
  isFirstInSection: boolean
}

function groupRowsBySection(rows: TopicDisplayRow[]): GroupedRow[] {
  const out: GroupedRow[] = []
  let i = 0
  while (i < rows.length) {
    const section = rows[i].sectionTitle
    let j = i + 1
    while (j < rows.length && rows[j].sectionTitle === section) j++
    const span = j - i
    for (let k = i; k < j; k++) {
      out.push({
        ...rows[k],
        sectionRowSpan: span,
        isFirstInSection: k === i,
      })
    }
    i = j
  }
  return out
}

const route = useRoute()

const slug = computed(() => String(route.params.slug ?? ''))

const moduleData = computed(() => {
  const s = slug.value
  if (!s) return null
  return getModuleDataBySlug(s)
})

const displayRows = computed((): TopicDisplayRow[] => {
  const m = moduleData.value
  if (!m) return []
  return expandTopicsToRows(m.topics)
})

const groupedRows = computed(() => groupRowsBySection(displayRows.value))
</script>

<template>
  <main class="pt-16">
    <section class="section-alt">
      <div class="container">
        <div class="max-w-7xl">
          <nav
            class="mb-2"
            aria-label="Breadcrumb"
          >
            <ol class="flex flex-wrap items-center gap-x-1 gap-y-1 text-sm md:text-[15px] font-mono leading-relaxed">
              <li class="inline-flex min-w-0 items-center">
                <RouterLink
                  to="/learn"
                  class="shrink-0 rounded-sm text-pink-600 underline-offset-2 transition-colors hover:text-pink-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:text-pink-400 dark:hover:text-pink-300"
                >
                  learn
                </RouterLink>
              </li>
              <li
                v-if="slug"
                class="inline-flex min-w-0 items-center gap-x-1 text-muted-foreground"
                aria-hidden="true"
              >
                <span>/</span>
              </li>
              <li v-if="slug" class="min-w-0 break-all">
                <span v-if="moduleData" class="text-foreground" aria-current="page">{{ slug }}.json</span>
                <span v-else class="text-destructive">{{ slug }}.json</span>
              </li>
            </ol>
          </nav>

          <template v-if="moduleData">
            <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight">
              {{ moduleData.title }}
            </h1>

            <div
              v-if="groupedRows.length === 0"
              class="text-muted-foreground text-[15px] md:text-[20px] py-8"
            >
              No topics in this module.
            </div>

            <div
              v-else
              class="overflow-x-auto rounded-lg border border-border/60 -mx-1 px-1 sm:mx-0 sm:px-0"
            >
              <table class="w-full min-w-[56rem] table-fixed border-collapse border border-border/60 text-left">
                <thead class="bg-muted/30">
                  <tr>
                    <th
                      scope="col"
                      class="w-[22%] min-w-[8rem] border-b border-border/60 px-3 py-3 text-sm font-semibold text-muted-foreground align-top"
                    >
                      Section
                    </th>
                    <th
                      scope="col"
                      class="w-[22%] min-w-[8rem] border-b border-border/60 px-3 py-3 text-sm font-semibold text-muted-foreground align-top"
                    >
                      Subtopic
                    </th>
                    <th
                      scope="col"
                      class="border-b border-border/60 px-3 py-3 text-sm font-semibold text-muted-foreground align-top"
                    >
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(row, idx) in groupedRows"
                    :key="`${row.sectionTitle}::${row.subtopicKey}::${idx}`"
                    class="border-b border-border/60 last:border-b-0"
                  >
                    <th
                      v-if="row.isFirstInSection"
                      scope="rowgroup"
                      :rowspan="row.sectionRowSpan"
                      class="px-3 py-3 align-top text-[15px] md:text-[17px] font-medium text-foreground whitespace-normal break-words border-r border-border/40 bg-muted/15"
                    >
                      {{ row.sectionTitle }}
                    </th>
                    <td
                      class="px-3 py-3 align-top text-xs md:text-sm font-mono text-muted-foreground whitespace-normal break-all border-r border-border/40"
                    >
                      {{ row.subtopicKey }}
                    </td>
                    <td class="px-3 py-3 align-top whitespace-normal break-words">
                      <ul v-if="row.bullets.length" class="list-disc pl-5 space-y-1.5">
                        <li
                          v-for="(line, bidx) in row.bullets"
                          :key="bidx"
                          class="text-[15px] md:text-[17px] text-foreground/90 leading-snug"
                        >
                          {{ line }}
                        </li>
                      </ul>
                      <div v-else class="text-muted-foreground text-[15px] md:text-[17px]">
                        —
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>

          <div v-else class="py-8 text-center">
            <p class="text-muted-foreground mb-2">This module was not found.</p>
            <p class="text-sm text-muted-foreground">
              Use the
              <RouterLink
                to="/learn"
                class="font-mono text-pink-600 underline-offset-2 hover:underline dark:text-pink-400"
              >learn</RouterLink>
              segment above to return to the module list.
            </p>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
