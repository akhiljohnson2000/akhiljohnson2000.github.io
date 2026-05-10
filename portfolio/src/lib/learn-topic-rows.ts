/**
 * Supported `topics` shapes:
 *
 * 1) Flat checklist — array of strings (see `01_HTML.json`):
 *    `"topics": ["item one", "item two", ...]`
 *
 * 2) Nested sections — array of objects:
 *    `"topics": [{ "Section title": { "subtopic_key": ["bullet", ...] } }, ...]`
 */

export type TopicDisplayRow = {
  sectionTitle: string
  subtopicKey: string
  bullets: string[]
}

/** One row for flat-string modules (numbered checklist). */
export type FlatTopicRow = {
  index: number
  text: string
}

export function topicsDisplayMode(topics: unknown): 'flat' | 'nested' {
  if (!Array.isArray(topics) || topics.length === 0) return 'flat'
  return topics.every((t) => typeof t === 'string') ? 'flat' : 'nested'
}

export function expandFlatTopicRows(topics: unknown): FlatTopicRow[] {
  if (!Array.isArray(topics)) return []
  const rows: FlatTopicRow[] = []
  let n = 0
  for (const t of topics) {
    if (typeof t !== 'string') continue
    n += 1
    rows.push({ index: n, text: t })
  }
  return rows
}

function expandOneTopic(t: unknown): TopicDisplayRow[] {
  if (!t || typeof t !== 'object' || Array.isArray(t)) return []
  const o = t as Record<string, unknown>
  const rows: TopicDisplayRow[] = []

  for (const [sectionTitle, inner] of Object.entries(o)) {
    if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
      for (const [subtopicKey, arr] of Object.entries(inner as Record<string, unknown>)) {
        const bullets = Array.isArray(arr)
          ? arr.map((x) => (typeof x === 'string' ? x : JSON.stringify(x)))
          : []
        rows.push({ sectionTitle, subtopicKey, bullets })
      }
    }
  }
  return rows
}

export function expandTopicsToRows(topics: unknown): TopicDisplayRow[] {
  if (!Array.isArray(topics)) return []
  return topics.flatMap(expandOneTopic)
}

export function countTopicRows(topics: unknown): number {
  if (!Array.isArray(topics)) return 0
  if (topics.every((t) => typeof t === 'string')) return topics.length
  return expandTopicsToRows(topics).length
}

export function collectSearchableFromTopics(topics: unknown): string[] {
  const out: string[] = []
  if (!Array.isArray(topics)) return out

  if (topics.every((t) => typeof t === 'string')) {
    for (const t of topics) {
      if (typeof t === 'string') out.push(t)
    }
    return out
  }

  for (const t of topics) {
    if (!t || typeof t !== 'object' || Array.isArray(t)) continue
    const o = t as Record<string, unknown>

    for (const [sectionTitle, inner] of Object.entries(o)) {
      out.push(sectionTitle)
      if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
        for (const [subKey, arr] of Object.entries(inner as Record<string, unknown>)) {
          out.push(subKey)
          if (Array.isArray(arr)) {
            for (const line of arr) {
              out.push(typeof line === 'string' ? line : JSON.stringify(line))
            }
          }
        }
      }
    }
  }
  return out
}
