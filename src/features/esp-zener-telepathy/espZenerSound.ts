'use client'

// Self-contained Web Audio synthesis — no external audio asset files exist
// in this project, and the shared src/lib/audio/soundManager.ts is a
// documented placeholder (no ESP-shaped sound ids, playSound() is a hard
// no-op regardless of its enabled flag, no working backend), so it isn't
// reusable as-is. Rather than fork it into a half-working state, this is a
// small, genuinely working, self-contained synth scoped to this feature
// only. Both functions are only ever called from within a real user-
// gesture click handler (a guess tap), never on mount, so the browser's
// autoplay-gate on AudioContext is honestly satisfied.
type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext }

let sharedAudioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (sharedAudioContext === null) {
    const AudioContextCtor = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext
    if (AudioContextCtor === undefined) return null
    sharedAudioContext = new AudioContextCtor()
  }
  if (sharedAudioContext.state === 'suspended') {
    void sharedAudioContext.resume()
  }
  return sharedAudioContext
}

function playTone(frequencyHz: number, durationMs: number, waveform: OscillatorType): void {
  const context = getAudioContext()
  if (context === null) return
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = waveform
  oscillator.frequency.value = frequencyHz
  gain.gain.setValueAtTime(0.15, context.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + durationMs / 1000)
  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start()
  oscillator.stop(context.currentTime + durationMs / 1000)
}

// A short bright two-note ascending chime for a correct guess.
export function playCorrectGuessSound(): void {
  playTone(880, 140, 'sine')
  if (typeof window !== 'undefined') {
    window.setTimeout(() => playTone(1174, 180, 'sine'), 90)
  }
}

// A low, soft tone for an incorrect guess — informative, not punishing.
export function playIncorrectGuessSound(): void {
  playTone(180, 220, 'triangle')
}
