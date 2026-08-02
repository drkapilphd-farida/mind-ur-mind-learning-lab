'use client'

// A tiny, dependency-free chime engine — every sound is synthesized on
// the fly via the Web Audio API (sine-wave oscillators + a gain
// envelope), so there are no audio assets to ship or load. One shared
// AudioContext is created lazily, on first real use, since browsers
// block audio until a genuine user gesture — every call site here is
// already wired to a click handler or a completion moment that follows
// one, so this never needs an explicit "enable sound" prompt.

let sharedAudioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (sharedAudioContext === null) {
    const AudioContextConstructor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (AudioContextConstructor === undefined) return null
    sharedAudioContext = new AudioContextConstructor()
  }
  if (sharedAudioContext.state === 'suspended') {
    void sharedAudioContext.resume()
  }
  return sharedAudioContext
}

// One short sine tone with a soft attack/decay envelope — never a harsh
// on/off click. `startDelayMs` lets several tones be scheduled as one
// short melodic phrase (see the arpeggios below) without stacking
// setTimeout calls.
function playTone(frequencyHz: number, durationMs: number, startDelayMs = 0, peakGain = 0.16): void {
  const ctx = getAudioContext()
  if (ctx === null) return

  const startTime = ctx.currentTime + startDelayMs / 1000
  const stopTime = startTime + durationMs / 1000

  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(frequencyHz, startTime)

  gainNode.gain.setValueAtTime(0, startTime)
  gainNode.gain.linearRampToValueAtTime(peakGain, startTime + 0.02)
  gainNode.gain.exponentialRampToValueAtTime(0.0001, stopTime)

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)
  oscillator.start(startTime)
  oscillator.stop(stopTime + 0.05)
}

// A light, neutral tap — every navigational button in this flow.
export function playClickChime(): void {
  playTone(880, 70, 0, 0.1)
}

// A quick, bright two-note "ding" — a single correct answer.
export function playCorrectChime(): void {
  playTone(880, 110, 0, 0.14)
  playTone(1318.51, 150, 80, 0.12)
}

// A soft, low tone — a missed answer. Deliberately gentle, never harsh
// or buzzer-like, matching this flow's "encourage, never shame" tone.
export function playGentleMissChime(): void {
  playTone(392, 180, 0, 0.09)
}

// A short ascending 3-note arpeggio (C5–E5–G5) — one level of the daily
// session finishing.
export function playLevelCompleteChime(): void {
  playTone(523.25, 140, 0, 0.15)
  playTone(659.25, 140, 110, 0.15)
  playTone(783.99, 240, 220, 0.16)
}

// A brighter, slightly larger two-note swell — an XP/reward popup
// appearing, distinct from plain level-complete so a reward always
// feels like a small extra beat of delight.
export function playRewardChime(): void {
  playTone(659.25, 130, 0, 0.15)
  playTone(987.77, 280, 100, 0.16)
}

// The full session's own finale — a longer 4-note ascending phrase.
export function playSessionCompleteChime(): void {
  playTone(523.25, 130, 0, 0.15)
  playTone(659.25, 130, 100, 0.15)
  playTone(783.99, 130, 200, 0.15)
  playTone(1046.5, 320, 300, 0.17)
}

// Day 21 Completion Certificate™ — the biggest moment in the whole 21-Day
// Journey (a genuine once-per-user finale, not a routine completion),
// so this deliberately goes further than playSessionCompleteChime: the
// same ascending run continues one note higher, then resolves into a
// sustained 3-note chord (C6-E6-G6 together) rather than a single final
// tone — still the same synthesized sine-tone technique, just a longer,
// fuller phrase for a genuinely rare event.
export function playCertificateFanfare(): void {
  playTone(523.25, 120, 0, 0.15)
  playTone(659.25, 120, 110, 0.15)
  playTone(783.99, 120, 220, 0.16)
  playTone(1046.5, 160, 330, 0.17)
  playTone(1046.5, 550, 520, 0.13)
  playTone(1318.51, 550, 520, 0.11)
  playTone(1567.98, 550, 520, 0.11)
}
