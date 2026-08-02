// Gamification framework — Sprint-1 architecture only. Types define the
// contract; no XP math or badge catalog exists yet (that's real scoring
// work, deferred with the engines that will feed it — see this sprint's
// plan). A confirmed audit found no shared cross-lab gamification system
// anywhere in this codebase — every lab today reinvents its own streak/
// achievement logic — so this is the first shared contract, not a
// replacement for any of them.
export type CelebrationTone = 'stage-complete' | 'profile-ready'

export type CelebrationTrigger = {
  tone: CelebrationTone
  headline: string
}

// A real, disclosed, future XP event — never emitted with a fabricated
// amount before a real scoring engine exists to justify one.
export type XpEvent = {
  domain: 'reading' | 'memory' | 'focus'
  amount: number
  reason: string
}
