import { collectSearchableFromTopics, countTopicRows } from '@/lib/learn-topic-rows'

export type LearnModuleJson = {
  order: number
  title: string
  /** Each item: `{ "Section title": { "subtopic_key": ["detail", ...] } }`. */
  topics: unknown[]
}

const moduleGlob = import.meta.glob<{ default: LearnModuleJson }>(
  '../learn/frontend-checklist/modules/*.json',
  { eager: true },
)

/** Basename must be like `01_HTML_Mastery.json` */
const MODULE_FILENAME_RE = /^(\d{2})_([A-Za-z0-9_]+)\.json$/

export function parseModuleBasename(base: string): { order: number; id: string; fileName: string } | null {
  const m = base.match(MODULE_FILENAME_RE)
  if (!m) return null
  const order = Number.parseInt(m[1], 10)
  const id = `${m[1]}_${m[2]}`
  return { order, id, fileName: base }
}

function globBasename(key: string): string {
  const parts = key.split('/')
  return parts[parts.length - 1] ?? key
}

function moduleKeyForId(id: string): string | undefined {
  if (!/^\d{2}_[A-Za-z0-9_]+$/.test(id)) return undefined
  const suffix = `/${id}.json`
  return Object.keys(moduleGlob).find((k) => k.endsWith(suffix))
}

export function getModuleDataBySlug(id: string): LearnModuleJson | null {
  const key = moduleKeyForId(id)
  if (!key) return null
  return moduleGlob[key]?.default ?? null
}

export type LearnModuleTile = {
  /** Route param, e.g. `01_HTML_Mastery` */
  id: string
  /** Full file name, e.g. `01_HTML_Mastery.json` */
  fileName: string
  title: string
  order: number
  topicCount: number
  searchable: string
}

export function getModuleTiles(): LearnModuleTile[] {
  const tiles: LearnModuleTile[] = []
  for (const key of Object.keys(moduleGlob)) {
    const base = globBasename(key)
    const parsed = parseModuleBasename(base)
    if (!parsed) continue
    const mod = moduleGlob[key].default
    const topics = mod?.topics ?? []
    const title = mod?.title?.trim() || parsed.id
    const searchable = [parsed.fileName, parsed.id, title, ...collectSearchableFromTopics(topics)]
      .join(' ')
      .toLowerCase()
    tiles.push({
      id: parsed.id,
      fileName: parsed.fileName,
      title,
      order: parsed.order,
      topicCount: countTopicRows(topics),
      searchable,
    })
  }
  return tiles.sort((a, b) => a.order - b.order || a.fileName.localeCompare(b.fileName))
}

export function filterModuleTiles(tiles: LearnModuleTile[], query: string): LearnModuleTile[] {
  const parts = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
  if (!parts.length) return tiles
  return tiles.filter((t) => parts.every((p) => t.searchable.includes(p)))
}
