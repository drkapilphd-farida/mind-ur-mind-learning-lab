// Sprint-2.6 FIX-01/FIX-13 (CRITICAL) — "Current implementation displays
// extremely high WPM values... If users see 500+ WPM, they will believe
// they no longer need Quantum Speed Reading™." This exercise measures
// exposure-duration on individual flashed words/phrases/sentences, not
// continuous free reading — at the fast end of Progressive Pace™'s own
// real ramp, that raw math can produce a number far outside believable
// human reading speed. A ceiling here doesn't fabricate a good number
// (there is no floor — a genuinely slow, hesitant real read is shown
// exactly as measured); it only stops an honest calculation artifact
// from ever being presented as a real reading-speed claim. "Trust is
// more valuable than impressive metrics."
const REALISTIC_WPM_CEILING = 280

export function clampToRealisticWpm(wpm: number): number {
  return Math.min(REALISTIC_WPM_CEILING, wpm)
}
