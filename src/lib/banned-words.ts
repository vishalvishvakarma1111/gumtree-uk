import type { SupabaseClient } from '@supabase/supabase-js'

export interface BannedWordHit {
  word: string
  severity: 'block' | 'flag'
}

/**
 * Scan free-text fields for any banned-words match. Case-insensitive,
 * whole-word match on word boundaries.
 *
 * Returns every hit (caller decides whether `block` blocks the request
 * or `flag` only marks for review).
 */
export async function scanBannedWords(
  supabase: SupabaseClient,
  texts: Array<string | null | undefined>,
): Promise<BannedWordHit[]> {
  const haystack = texts
    .filter((t): t is string => typeof t === 'string' && t.length > 0)
    .join(' \n ')
    .toLowerCase()
  if (!haystack) return []

  const { data, error } = await supabase
    .from('banned_words')
    .select('word, severity')
  if (error || !data) return []

  const hits: BannedWordHit[] = []
  for (const row of data as Array<{ word: string; severity: 'block' | 'flag' }>) {
    const w = row.word.toLowerCase().trim()
    if (!w) continue
    const escaped = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(`\\b${escaped}\\b`, 'i')
    if (re.test(haystack)) hits.push({ word: row.word, severity: row.severity })
  }
  return hits
}
