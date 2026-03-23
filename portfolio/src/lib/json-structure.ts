/**
 * Build a JSON-shaped tree with the same keys as `input`, values replaced by
 * empty placeholders. Arrays collapse to a single element showing the structure
 * of `input[0]` (or `[]` if empty).
 */
export function jsonKeysStructure(input: unknown): unknown {
  if (input === null) return null
  if (Array.isArray(input)) {
    if (input.length === 0) return []
    return [jsonKeysStructure(input[0])]
  }
  if (typeof input === 'object') {
    const out: Record<string, unknown> = {}
    for (const key of Object.keys(input as Record<string, unknown>)) {
      out[key] = jsonKeysStructure((input as Record<string, unknown>)[key])
    }
    return out
  }
  return ''
}
