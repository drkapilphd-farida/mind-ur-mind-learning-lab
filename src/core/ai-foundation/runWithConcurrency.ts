// AI Foundation Layer™ — shared bounded-concurrency worker pool. Moved
// out of Semantic Enrichment Engine™ (UCE-3B)'s own private
// `enrichLearningChunks.ts`, which keeps its own original copy untouched
// — this is the same, already-proven pattern, exported once so the
// Learning Knowledge Graph™ (UCE-4) and AI Learning Analysis Engine™
// (UCE-5) AI-derived call sites can reuse it instead of duplicating it a
// second and third time.
export async function runWithConcurrency<T, R>(items: readonly T[], concurrency: number, worker: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let nextIndex = 0

  async function runNext(): Promise<void> {
    const currentIndex = nextIndex
    nextIndex += 1
    if (currentIndex >= items.length) return
    results[currentIndex] = await worker(items[currentIndex] as T)
    await runNext()
  }

  const workerCount = Math.max(1, Math.min(concurrency, items.length))
  await Promise.all(Array.from({ length: workerCount }, () => runNext()))
  return results
}
