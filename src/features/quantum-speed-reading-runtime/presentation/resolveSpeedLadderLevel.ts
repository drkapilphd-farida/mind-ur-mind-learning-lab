// Quantum Speed Reading Experience Engine™ (QSR-E1) — Speed Ladder™. The
// exact WPM ladder named in the locked brief. Purely a presentation
// banding over a real WPM number — never a claim of a "correct" speed;
// slower-but-accurate reading is real and valid, this is progress
// framing only.
export const SPEED_LADDER_RUNGS = [100, 150, 200, 250, 300, 350, 400] as const

export type SpeedLadderLevel = {
  level: number
  rung: number
  nextRung: number | null
}

export function resolveSpeedLadderLevel(wpm: number): SpeedLadderLevel {
  let level = 0
  for (const rung of SPEED_LADDER_RUNGS) {
    if (wpm < rung) break
    level += 1
  }

  const rung = level > 0 ? (SPEED_LADDER_RUNGS[level - 1] ?? 0) : 0
  const nextRung = SPEED_LADDER_RUNGS[level] ?? null

  return { level, rung, nextRung }
}
