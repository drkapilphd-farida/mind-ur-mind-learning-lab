// Reading Assessment Engine™ — deterministic seed hash + shuffle, shared
// by every new question builder in this `assessment/questions/` folder.
// Unlike `buildComprehensionQuestions.ts`'s own copy of the same ~20
// lines (duplicated there because it's a separate, independently
// maintained feature area from `mcqs-mode-runtime`'s own copy), these
// four builders are new, created together, in one folder, for one
// feature — sharing here avoids four identical copies within a single
// module rather than crossing a real feature boundary.
export function hashString(value: string): number {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0
  }
  return hash >>> 0
}

// Deterministic PRNG (mulberry32) + Fisher-Yates shuffle — the same
// input always produces the same output, never `Math.random()`.
export function seededShuffle<T>(items: readonly T[], seed: number): readonly T[] {
  let state = seed
  const next = (): number => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  const result = [...items]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(next() * (i + 1))
    const temp = result[i]
    result[i] = result[j] as T
    result[j] = temp as T
  }
  return result
}

export function dedupeValues(values: readonly string[], exclude?: string): readonly string[] {
  const seen = new Set(exclude ? [normalize(exclude)] : [])
  const result: string[] = []
  for (const value of values) {
    const normalized = normalize(value)
    if (seen.has(normalized)) continue
    seen.add(normalized)
    result.push(value)
  }
  return result
}

export function normalize(value: string): string {
  return value.trim().toLowerCase()
}
