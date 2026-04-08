/**
 * Module JSON shape (all modules use this):
 * "topics": [
 *   { "Section title": { "subtopic_key": ["bullet", ...], ... } },
 *   ...
 * ]
 */

export type TopicDisplayRow = {
  sectionTitle: string
  subtopicKey: string
  bullets: string[]
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
  return expandTopicsToRows(topics).length
}

export function collectSearchableFromTopics(topics: unknown): string[] {
  const out: string[] = []
  if (!Array.isArray(topics)) return out

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
