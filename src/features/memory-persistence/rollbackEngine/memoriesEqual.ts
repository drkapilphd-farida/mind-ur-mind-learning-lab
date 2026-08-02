import type { Memory } from '../domain'

// Pure — a plain-data deep-equality check. `Memory` (and its nested
// `metadata`/`tags`) is always constructed consistently (never
// dynamically reordered) throughout this feature, so a
// `JSON.stringify` comparison is a reliable, dependency-free
// equivalent to a real deep-equal here.
export function memoriesEqual(a: Memory | null, b: Memory | null): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}
