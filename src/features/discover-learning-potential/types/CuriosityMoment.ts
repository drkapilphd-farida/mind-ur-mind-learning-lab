// Discover Your Learning Potential™ — Sprint-1 Foundation. Curiosity
// Loop™ framework — the named contract behind a pattern existing
// components (`TransitionCard.tsx` in reading, `WelcomeCard.tsx` in
// memory) already independently converged on: a brief, warm beat that
// pulls the learner into the next screen. Those stay untouched (each
// already does this well); this type documents the shared shape for
// `CuriosityBridge` and any future stage's own transition (e.g. Memory
// and Focus Discovery's own Mission Curiosity Loop between missions).
export type CuriosityTone = 'progress' | 'anticipation' | 'reveal'

export type CuriosityMoment = {
  headline: string
  tone: CuriosityTone
}
