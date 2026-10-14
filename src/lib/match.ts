/**
 * The palette's matcher: pure, dependency-free, accent-insensitive. The
 * label always outranks a keyword, and a keyword outranks the group, so what a
 * screen is called wins over what people also call it.
 */

type Matchable = {label: string; group?: string; keywords?: readonly string[]}

/** Lowercase, no diacritics, single spaces. */
function foldText(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/\s+/g, " ").trim()
}

const startsWord = (text: string, token: string) => text.split(" ").some(w => w.startsWith(token))

/** The best score one token earns in an entry; 0 means the token is nowhere in it. */
function tokenScore(label: string, keywords: string[], group: string, token: string): number {
  if (label.startsWith(token)) return 100
  if (startsWord(label, token)) return 80
  if (label.includes(token)) return 60
  if (keywords.some(k => startsWord(k, token))) return 40
  if (keywords.some(k => k.includes(token))) return 30
  if (group.includes(token)) return 10
  return 0
}

function matchEntries<T extends Matchable>(entries: readonly T[], query: string, limit = 8): T[] {
  const folded = foldText(query)
  if (!folded) return entries.slice(0, limit)
  const tokens = folded.split(" ")
  return entries
    .map((entry, index) => {
      const label = foldText(entry.label)
      const keywords = (entry.keywords ?? []).map(foldText)
      const group = foldText(entry.group ?? "")
      let score = label.startsWith(folded) ? 50 : 0
      for (const token of tokens) {
        const s = tokenScore(label, keywords, group, token)
        if (s === 0) return {entry, index, score: 0}
        score += s
      }
      return {entry, index, score}
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map(r => r.entry)
}

export {foldText, matchEntries, type Matchable}
