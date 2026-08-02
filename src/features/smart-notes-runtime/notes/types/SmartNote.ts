// Smart Notes™ Sprint-2 — Reading & Notes Workspace™. Real, free-text
// note content, scoped per (learner, document) — confirmed with the
// founder — not per session: one growing set of notes per learner per
// document, independent of any single session's own start/pause/finish
// lifecycle. Deliberately not part of LSE-3's own `SessionSnapshot`
// (bounded/derived by design, never a home for raw growing user content)
// — this is its own small, dedicated concern.
export type SmartNote = {
  documentId: string
  content: string
  updatedAt: string
}
