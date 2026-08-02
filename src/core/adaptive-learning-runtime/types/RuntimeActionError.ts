// Adaptive Learning Runtime™ (LSE-2). Plain data, not a thrown Error —
// the same Result-type convention LSE-1 and every prior UCE layer uses.
// `chunk-not-in-queue` is new here (LSE-1 has no analogue): real/
// skip/repeat/revisit-later decisions all target a specific chunk that
// must exist in the runtime's own `scheduledQueue`. `no-previous-chunk`
// is added by the QSR Sprint-1 amendment (see decisions/previousChunk.ts)
// — the one real, honest failure "previous" can produce: there is
// nothing behind the first scheduled item.
export type RuntimeActionErrorCode = 'invalid-transition' | 'ulo-mismatch' | 'empty-queue' | 'chunk-not-in-queue' | 'no-previous-chunk'

export type RuntimeActionError = {
  code: RuntimeActionErrorCode
  message: string
}
