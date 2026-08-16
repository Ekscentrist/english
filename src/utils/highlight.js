export function searchTerms(query) {
  const phrase = String(query ?? '').trim()
  if (!phrase) return []

  const words = phrase.split(/\s+/).filter(Boolean)
  const seen = new Set()
  const terms = []

  for (const term of [phrase, ...words]) {
    const key = term.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    terms.push(term)
  }

  terms.sort((a, b) => b.length - a.length)
  return terms
}

export function matchesQuery(query, ...texts) {
  const needle = String(query ?? '').trim().toLowerCase()
  if (!needle) return true
  return texts.some((text) => String(text ?? '').toLowerCase().includes(needle))
}

export function highlightParts(text, query) {
  const source = String(text ?? '')
  const terms = searchTerms(query)
  if (!source || !terms.length) return [{ text: source, hit: false }]

  const lower = source.toLowerCase()
  const ranges = []

  for (const term of terms) {
    const needle = term.toLowerCase()
    if (!needle) continue
    let from = 0
    while (from <= lower.length - needle.length) {
      const idx = lower.indexOf(needle, from)
      if (idx === -1) break
      ranges.push({ start: idx, end: idx + needle.length })
      from = idx + needle.length
    }
  }

  if (!ranges.length) return [{ text: source, hit: false }]

  ranges.sort((a, b) => a.start - b.start || b.end - a.end)
  const merged = []
  for (const range of ranges) {
    const last = merged[merged.length - 1]
    if (last && range.start <= last.end) {
      last.end = Math.max(last.end, range.end)
    } else {
      merged.push({ start: range.start, end: range.end })
    }
  }

  const parts = []
  let cursor = 0
  for (const range of merged) {
    if (range.start > cursor) {
      parts.push({ text: source.slice(cursor, range.start), hit: false })
    }
    parts.push({ text: source.slice(range.start, range.end), hit: true })
    cursor = range.end
  }
  if (cursor < source.length) {
    parts.push({ text: source.slice(cursor), hit: false })
  }
  return parts
}
