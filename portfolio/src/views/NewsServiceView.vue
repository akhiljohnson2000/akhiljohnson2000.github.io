<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import Navbar from '@/components/Navbar.vue'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardDescription from '@/components/ui/CardDescription.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Badge from '@/components/ui/Badge.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import { RouterLink } from 'vue-router'
import { ExternalLink, Filter, Loader2, RefreshCw } from 'lucide-vue-next'

const PAGE_SIZE = 24

type Endpoint = 'everything' | 'top-headlines'

type Article = {
  source?: { id?: string | null; name?: string | null }
  author?: string | null
  title?: string | null
  description?: string | null
  url?: string | null
  urlToImage?: string | null
  publishedAt?: string | null
  content?: string | null
}

type NewsApiResponse = {
  status: 'ok' | 'error'
  totalResults?: number
  articles?: Article[]
  message?: string
  code?: string
}

const apiKey = import.meta.env.VITE_NEWS_API_KEY as string | undefined
const apiBase = (import.meta.env.VITE_NEWS_API_BASE as string | undefined) ?? 'https://newsapi.org'

const showFilters = ref(false)
const endpoint = ref<Endpoint>('everything')
const q = ref('')
const sortBy = ref<'publishedAt' | 'relevancy' | 'popularity'>('publishedAt')
const language = ref<'en' | 'ar' | 'de' | 'es' | 'fr' | 'he' | 'it' | 'nl' | 'no' | 'pt' | 'ru' | 'sv' | 'ud' | 'zh'>('en')
const from = ref<string>('')
const to = ref<string>('')
const sources = ref<string>('')

const country = ref<'us' | 'in'>('us')
const category = ref<'technology' | 'business' | 'entertainment' | 'general' | 'health' | 'science' | 'sports'>('technology')

const page = ref(1)
const isLoading = ref(false)
const isLoadingMore = ref(false)
const error = ref<string | null>(null)
const totalResults = ref<number | null>(null)
const articles = ref<Article[]>([])
const sentinelRef = ref<HTMLElement | null>(null)

const canFetch = computed(() => Boolean(apiKey))
const hasMore = computed(
  () =>
    totalResults.value != null &&
    articles.value.length > 0 &&
    articles.value.length < totalResults.value
)

function isoDateMaybe(date: string) {
  return date ? new Date(date).toISOString() : undefined
}

function buildUrl(pageNum: number) {
  const url = new URL(`${apiBase.replace(/\/$/, '')}/v2/${endpoint.value}`)

  if (endpoint.value === 'everything') {
    url.searchParams.set('q', q.value?.trim() || 'news')
    url.searchParams.set('sortBy', sortBy.value)
    url.searchParams.set('language', language.value)
    if (from.value) url.searchParams.set('from', isoDateMaybe(from.value)!)
    if (to.value) url.searchParams.set('to', isoDateMaybe(to.value)!)
    if (sources.value.trim()) url.searchParams.set('sources', sources.value.trim())
  } else {
    url.searchParams.set('country', country.value)
    url.searchParams.set('category', category.value)
    url.searchParams.set('q', q.value?.trim() || 'news')
  }

  url.searchParams.set('pageSize', String(PAGE_SIZE))
  url.searchParams.set('page', String(pageNum))
  url.searchParams.set('apiKey', apiKey || '')
  return url
}

async function fetchNews(append: boolean) {
  if (!canFetch.value) return

  const pageNum = append ? page.value : 1
  if (!append) {
    page.value = 1
    isLoading.value = true
  } else {
    isLoadingMore.value = true
  }
  error.value = null

  try {
    const url = buildUrl(pageNum)
    const res = await fetch(url.toString())
    const data = (await res.json()) as NewsApiResponse

    if (!res.ok || data.status === 'error') {
      error.value =
        data.message ||
        `Request failed (${res.status}). This API may block browser requests (CORS) unless you use a proxy/server.`
      totalResults.value = null
      if (!append) articles.value = []
      return
    }

    totalResults.value = data.totalResults ?? 0
    const newArticles = data.articles ?? []
    if (append) {
      articles.value = [...articles.value, ...newArticles]
    } else {
      articles.value = newArticles
    }
  } catch (e) {
    error.value =
      e instanceof Error
        ? e.message
        : 'Failed to fetch news. This can happen if the API blocks browser requests (CORS) or network is unavailable.'
    totalResults.value = null
    if (!append) articles.value = []
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
  }
}

function loadMore() {
  if (!hasMore.value || isLoading.value || isLoadingMore.value || !canFetch.value) return
  page.value++
  fetchNews(true)
}

let observer: IntersectionObserver | null = null
function observeSentinel() {
  observer?.disconnect()
  if (sentinelRef.value) observer?.observe(sentinelRef.value)
}
onMounted(() => {
  fetchNews(false)
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) loadMore()
    },
    { rootMargin: '200px', threshold: 0 }
  )
  nextTick(observeSentinel)
})
onUnmounted(() => {
  observer?.disconnect()
})
watch(sentinelRef, observeSentinel)

// When filters change, reset and fetch first page (debounced for q)
let searchDebounce: ReturnType<typeof setTimeout> | null = null
watch(
  [endpoint, q, sortBy, language, from, to, sources, country, category],
  () => {
    if (searchDebounce) clearTimeout(searchDebounce)
    searchDebounce = setTimeout(() => {
      page.value = 1
      fetchNews(false)
    }, 400)
  },
  { deep: true }
)
</script>

<template>
  <div class="min-h-screen bg-background">
    <Navbar />

    <main class="pt-24">
      <section class="section-alt">
        <div class="container mx-auto px-4">
          <div class="max-w-6xl mx-auto">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 class="text-2xl md:text-3xl font-bold tracking-tight">News</h1>
                <p class="text-muted-foreground text-sm mt-1">
                  Scroll for more. Opens articles on their original sites.
                </p>
              </div>
              <div class="flex items-center gap-2">
                <Button variant="outline" as-child>
                  <RouterLink to="/services">Back</RouterLink>
                </Button>
                <Button variant="outline" :disabled="isLoading || !canFetch" @click="fetchNews(false)">
                  <RefreshCw class="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            <!-- Search + Filter bar -->
            <div class="flex flex-wrap items-center gap-3 mb-6">
              <div class="flex-1 min-w-[200px]">
                <Input
                  v-model="q"
                  placeholder="Search news (e.g. technology, sports)"
                  class="w-full"
                  type="search"
                />
              </div>
              <Button
                variant="outline"
                :class="showFilters ? 'bg-muted' : ''"
                @click="showFilters = !showFilters"
              >
                <Filter class="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            <!-- Collapsible filter options -->
            <Card v-show="showFilters" class="mb-8">
              <CardHeader>
                <CardTitle>Filter options</CardTitle>
                <CardDescription>
                  Endpoint: {{ endpoint }}.
                  <span v-if="!canFetch" class="text-destructive">Missing `VITE_NEWS_API_KEY`.</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label class="text-xs font-medium text-muted-foreground">Endpoint</label>
                    <select
                      v-model="endpoint"
                      class="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
                    >
                      <option value="everything">everything</option>
                      <option value="top-headlines">top-headlines</option>
                    </select>
                  </div>

                  <template v-if="endpoint === 'everything'">
                    <div>
                      <label class="text-xs font-medium text-muted-foreground">Sort</label>
                      <select
                        v-model="sortBy"
                        class="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
                      >
                        <option value="publishedAt">publishedAt</option>
                        <option value="relevancy">relevancy</option>
                        <option value="popularity">popularity</option>
                      </select>
                    </div>
                    <div>
                      <label class="text-xs font-medium text-muted-foreground">Language</label>
                      <select
                        v-model="language"
                        class="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
                      >
                        <option value="en">en</option>
                        <option value="de">de</option>
                        <option value="es">es</option>
                        <option value="fr">fr</option>
                        <option value="it">it</option>
                        <option value="nl">nl</option>
                        <option value="no">no</option>
                        <option value="pt">pt</option>
                        <option value="ru">ru</option>
                        <option value="sv">sv</option>
                        <option value="zh">zh</option>
                      </select>
                    </div>
                    <div>
                      <label class="text-xs font-medium text-muted-foreground">From</label>
                      <Input v-model="from" class="mt-1" type="date" />
                    </div>
                    <div>
                      <label class="text-xs font-medium text-muted-foreground">To</label>
                      <Input v-model="to" class="mt-1" type="date" />
                    </div>
                    <div class="md:col-span-3">
                      <label class="text-xs font-medium text-muted-foreground">Sources (comma-separated ids)</label>
                      <Input v-model="sources" class="mt-1" placeholder="the-verge,wired" />
                    </div>
                  </template>
                  <template v-else>
                    <div>
                      <label class="text-xs font-medium text-muted-foreground">Country</label>
                      <select
                        v-model="country"
                        class="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
                      >
                        <option value="us">us</option>
                        <option value="in">in</option>
                      </select>
                    </div>
                    <div>
                      <label class="text-xs font-medium text-muted-foreground">Category</label>
                      <select
                        v-model="category"
                        class="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
                      >
                        <option value="technology">technology</option>
                        <option value="business">business</option>
                        <option value="entertainment">entertainment</option>
                        <option value="general">general</option>
                        <option value="health">health</option>
                        <option value="science">science</option>
                        <option value="sports">sports</option>
                      </select>
                    </div>
                  </template>
                </div>
                <div v-if="error" class="mt-4 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm">
                  {{ error }}
                </div>
              </CardContent>
            </Card>

            <div v-if="!showFilters && error" class="mb-6 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm">
              {{ error }}
            </div>

            <div class="text-xs text-muted-foreground mb-4 flex items-center gap-4">
              <span v-if="typeof totalResults === 'number'">{{ totalResults }} results · {{ articles.length }} loaded</span>
              <span v-if="isLoading" class="inline-flex items-center">
                <Loader2 class="h-4 w-4 mr-2 animate-spin" /> Loading…
              </span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card
                v-for="(a, i) in articles"
                :key="(a.url ?? '') + i"
                class="h-full flex flex-col transition-shadow duration-300 hover:shadow-md overflow-hidden"
              >
                <div
                  v-if="a.urlToImage"
                  class="aspect-video w-full overflow-hidden rounded-t-lg bg-muted shrink-0"
                >
                  <img
                    :src="a.urlToImage"
                    :alt="a.title ?? 'Article'"
                    class="w-full h-full object-cover transition-transform duration-300 ease-out hover:scale-[1.02]"
                    loading="lazy"
                  />
                </div>
                <CardHeader>
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <CardTitle class="line-clamp-2">{{ a.title || 'Untitled' }}</CardTitle>
                      <CardDescription class="mt-1">
                        <span v-if="a.source?.name">{{ a.source.name }}</span>
                        <span v-if="a.publishedAt"> · {{ new Date(a.publishedAt).toLocaleString() }}</span>
                      </CardDescription>
                    </div>
                    <Badge v-if="a.source?.id" variant="secondary" class="shrink-0">{{ a.source.id }}</Badge>
                  </div>
                </CardHeader>
                <CardContent class="flex-grow">
                  <p class="text-sm text-muted-foreground line-clamp-4">
                    {{ a.description || a.content || 'No description available.' }}
                  </p>
                </CardContent>
                <CardContent class="pt-0">
                  <Button v-if="a.url" as="a" :href="a.url" target="_blank" rel="noopener noreferrer" size="sm" class="w-full">
                    <ExternalLink class="h-4 w-4 mr-2" />
                    Open article
                  </Button>
                </CardContent>
              </Card>
            </div>

            <!-- Infinite scroll sentinel -->
            <div ref="sentinelRef" class="h-4 w-full" />

            <div
              v-if="isLoadingMore"
              class="flex justify-center py-8"
            >
              <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
            </div>

            <div v-if="!isLoading && !error && articles.length === 0" class="text-center text-muted-foreground py-12">
              No articles found. Try a different search or filters.
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>
