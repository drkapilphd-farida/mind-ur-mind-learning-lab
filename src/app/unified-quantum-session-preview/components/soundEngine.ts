'use client'

import { loadSoundEnabledPreference } from '@/lib/audio/soundPreference'

// A tiny, dependency-free chime engine — every sound is synthesized on
// the fly via the Web Audio API (sine-wave oscillators + a gain
// envelope), so there are no audio assets to ship or load. One shared
// AudioContext is created lazily, on first real use, since browsers
// block audio until a genuine user gesture — every call site here is
// already wired to a click handler or a completion moment that follows
// one, so this never needs an explicit "enable sound" prompt.
//
// Global Sound Preference™ — playTone is the one choke point every chime
// below funnels through, so gating it here makes every existing call
// site (quantum-journey, brain-gym, unified-session, ComprehensionQuestionFlow,
// etc.) respect the Settings sound toggle automatically, with no changes
// needed at any of those call sites.

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
  if (!loadSoundEnabledPreference()) return
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

// Focus Ambient™ — the exact tuned recipe already proven across this
// app's reading-mode exercises (VerticalWordReadingCanvas and siblings,
// own-copy there): a quiet, heavily low-passed sine drone with 4
// harmonic layers, slow to fade in/out so it's never a jarring on/off
// click. Reused here (not re-copied) for the 21-Day Journey's cognitive/
// reading/habit steps — one drone started once per session, at the
// orchestrator level, is simpler and more robust than threading a
// separate audio graph through every step. Shares this file's one lazy
// AudioContext (getAudioContext) rather than opening a second one.
//
// Two Soundscapes™ — this was the journey's only preset until Meditative
// Breath Drone (below) was added for MindAwakeningPhase's Box Breathing;
// the two are mutually exclusive (MindAwakeningPhase stops this one and
// starts the other on mount, and swaps back on unmount), never layered.
const FOCUS_FUNDAMENTAL_HZ = 110
const FOCUS_RESTING_GAIN = 0.014
const FOCUS_FADE_IN_TIME_CONSTANT_S = 2.5
const FOCUS_RELEASE_TIME_CONSTANT_S = 1.6
const FOCUS_RELEASE_SETTLE_MS = FOCUS_RELEASE_TIME_CONSTANT_S * 5 * 1000
const FOCUS_LOWPASS_CUTOFF_HZ = 900

const FOCUS_HARMONIC_LAYERS: readonly { multiplier: number; weight: number; pan: number }[] = [
  { multiplier: 1, weight: 1, pan: 0 },
  { multiplier: 2 ** (7 / 1200), weight: 0.85, pan: 0 },
  { multiplier: 2, weight: 0.3, pan: 0.2 },
  { multiplier: 3, weight: 0.15, pan: -0.2 },
]

type FocusVoice = { oscillator: OscillatorNode }
let focusState: { masterGain: GainNode; voices: readonly FocusVoice[] } | null = null

// Idempotent and preference-gated at call time only (matching playTone's
// own convention) — safe to call repeatedly (e.g. on every step
// transition) without stacking a second drone on top of the first.
export function startFocusAmbient(): void {
  if (focusState !== null) return
  if (!loadSoundEnabledPreference()) return
  const ctx = getAudioContext()
  if (ctx === null) return
  const now = ctx.currentTime

  const masterGain = ctx.createGain()
  masterGain.gain.setValueAtTime(0, now)
  masterGain.gain.setTargetAtTime(FOCUS_RESTING_GAIN, now, FOCUS_FADE_IN_TIME_CONSTANT_S)

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(FOCUS_LOWPASS_CUTOFF_HZ, now)
  filter.Q.setValueAtTime(0.7, now)
  masterGain.connect(filter)
  filter.connect(ctx.destination)

  const voices: FocusVoice[] = FOCUS_HARMONIC_LAYERS.map(({ multiplier, weight, pan }) => {
    const oscillator = ctx.createOscillator()
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(FOCUS_FUNDAMENTAL_HZ * multiplier, now)

    const voiceGain = ctx.createGain()
    voiceGain.gain.setValueAtTime(weight, now)

    const panner = ctx.createStereoPanner()
    panner.pan.setValueAtTime(pan, now)

    oscillator.connect(voiceGain)
    voiceGain.connect(panner)
    panner.connect(masterGain)
    oscillator.start()

    return { oscillator }
  })

  focusState = { masterGain, voices }
}

// Always safe to call, even if the drone was never started (a no-op) —
// callers don't need to track whether startFocusAmbient actually ran
// (e.g. because sound was off at the time).
export function stopFocusAmbient(): void {
  const state = focusState
  if (state === null) return
  focusState = null

  const ctx = getAudioContext()
  if (ctx === null) {
    for (const voice of state.voices) voice.oscillator.stop()
    return
  }

  const stopNow = ctx.currentTime
  state.masterGain.gain.cancelScheduledValues(stopNow)
  state.masterGain.gain.setValueAtTime(state.masterGain.gain.value, stopNow)
  state.masterGain.gain.setTargetAtTime(0, stopNow, FOCUS_RELEASE_TIME_CONSTANT_S)

  setTimeout(() => {
    for (const voice of state.voices) voice.oscillator.stop()
  }, FOCUS_RELEASE_SETTLE_MS)
}

// Meditative Breath Drone™ — a second, timbrally distinct soundscape for
// breath-paced exercises (MindAwakeningPhase's Box Breathing), adapted
// from the reverb-tailed harmonic-stack recipe already proven in
// src/components/qsr/visual-activation/ThetaBreathingAnchor.tsx (a
// different, 2-phase QSR lab exercise, not part of this journey) — the
// same singing-bowl-style partial stack + convolution-reverb technique,
// tuned to its own fundamental/gain scheme so it reads as a distinct
// "deeper, more resonant" preset next to Focus Ambient's flatter,
// quieter drone. Fully original synthesized audio — no external samples,
// no copyrighted recordings of any kind. Reuses this file's one shared
// lazy AudioContext (getAudioContext) rather than opening a private
// one — unlike ThetaBreathingAnchor's own teardown, this preset's stop
// function must therefore never call audioContext.close(), since other
// presets/chimes may still need the shared context afterward.
const MEDITATIVE_FUNDAMENTAL_HZ = 220 // A3
const MEDITATIVE_RESTING_GAIN = 0.04
const MEDITATIVE_SWELL_GAIN = 0.062
const MEDITATIVE_SWELL_TIME_CONSTANT_S = 1.3
const MEDITATIVE_RELEASE_TIME_CONSTANT_S = 0.6
const MEDITATIVE_RELEASE_SETTLE_MS = MEDITATIVE_RELEASE_TIME_CONSTANT_S * 5 * 1000
const MEDITATIVE_LOWPASS_CUTOFF_HZ = 2_600
const MEDITATIVE_REVERB_WET_LEVEL = 0.32
const MEDITATIVE_REVERB_DURATION_S = 2.2
const MEDITATIVE_REVERB_DECAY = 2.8

const MEDITATIVE_HARMONIC_LAYERS: readonly { multiplier: number; weight: number; pan: number }[] = [
  { multiplier: 1, weight: 1, pan: 0 },
  { multiplier: 2 ** (7 / 1200), weight: 0.85, pan: 0 },
  { multiplier: 2, weight: 0.3, pan: 0.2 },
  { multiplier: 3, weight: 0.15, pan: -0.2 },
]

// A short, softly-decaying stereo noise tail — the cheapest way to get a
// real convolution-reverb "bloom" without shipping an audio sample.
// Regenerated on each start (a ConvolverNode's buffer can't be reused
// across contexts, and this file's shared context can outlive any one
// preset's lifetime).
function createMeditativeReverbImpulse(audioContext: AudioContext): AudioBuffer {
  const length = Math.floor(audioContext.sampleRate * MEDITATIVE_REVERB_DURATION_S)
  const impulse = audioContext.createBuffer(2, length, audioContext.sampleRate)
  for (let channel = 0; channel < impulse.numberOfChannels; channel++) {
    const channelData = impulse.getChannelData(channel)
    for (let i = 0; i < length; i++) {
      channelData[i] = (Math.random() * 2 - 1) * (1 - i / length) ** MEDITATIVE_REVERB_DECAY
    }
  }
  return impulse
}

type MeditativeVoice = { oscillator: OscillatorNode }
let meditativeState: { masterGain: GainNode; voices: readonly MeditativeVoice[] } | null = null

// Idempotent and preference-gated, matching every other start* function
// in this file. masterGain starts and stays at 0 here — the caller's own
// first breath-phase transition (always "Breathe In", fired immediately
// after this by MindAwakeningPhase) performs the actual swell-in via
// updateMeditativeBreathSwell, so there's exactly one place that ever
// moves this gain, not two competing ramps.
export function startMeditativeBreathDrone(): void {
  if (meditativeState !== null) return
  if (!loadSoundEnabledPreference()) return
  const ctx = getAudioContext()
  if (ctx === null) return
  const now = ctx.currentTime

  const masterGain = ctx.createGain()
  masterGain.gain.setValueAtTime(0, now)

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(MEDITATIVE_LOWPASS_CUTOFF_HZ, now)
  filter.Q.setValueAtTime(0.7, now)

  const dryGain = ctx.createGain()
  dryGain.gain.setValueAtTime(1, now)
  const wetGain = ctx.createGain()
  wetGain.gain.setValueAtTime(MEDITATIVE_REVERB_WET_LEVEL, now)
  const convolver = ctx.createConvolver()
  convolver.buffer = createMeditativeReverbImpulse(ctx)

  masterGain.connect(filter)
  filter.connect(dryGain)
  dryGain.connect(ctx.destination)
  filter.connect(convolver)
  convolver.connect(wetGain)
  wetGain.connect(ctx.destination)

  const voices: MeditativeVoice[] = MEDITATIVE_HARMONIC_LAYERS.map(({ multiplier, weight, pan }) => {
    const oscillator = ctx.createOscillator()
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(MEDITATIVE_FUNDAMENTAL_HZ * multiplier, now)

    const voiceGain = ctx.createGain()
    voiceGain.gain.setValueAtTime(weight, now)

    const panner = ctx.createStereoPanner()
    panner.pan.setValueAtTime(pan, now)

    oscillator.connect(voiceGain)
    voiceGain.connect(panner)
    panner.connect(masterGain)
    oscillator.start()

    return { oscillator }
  })

  meditativeState = { masterGain, voices }
}

// The breath's only audible signature — a gentle loudness swell via
// exponential approach (setTargetAtTime, never a linear ramp — a linear
// fade has a perceptible mechanical edge; an exponential one breathes in
// and settles out the way a struck bowl actually does). A no-op if the
// drone was never started (e.g. sound was off at call time).
export function updateMeditativeBreathSwell(target: 'swell' | 'rest'): void {
  const state = meditativeState
  if (state === null) return
  const ctx = getAudioContext()
  if (ctx === null) return
  const now = ctx.currentTime
  const targetGain = target === 'swell' ? MEDITATIVE_SWELL_GAIN : MEDITATIVE_RESTING_GAIN
  state.masterGain.gain.cancelScheduledValues(now)
  state.masterGain.gain.setValueAtTime(state.masterGain.gain.value, now)
  state.masterGain.gain.setTargetAtTime(targetGain, now, MEDITATIVE_SWELL_TIME_CONSTANT_S)
}

// Always safe to call, even if the drone was never started. Deliberately
// never calls audioContext.close() — unlike ThetaBreathingAnchor's own
// private context, this file's AudioContext is shared and long-lived
// across every chime/preset, so closing it here would silence everything
// else too.
export function stopMeditativeBreathDrone(): void {
  const state = meditativeState
  if (state === null) return
  meditativeState = null

  const ctx = getAudioContext()
  if (ctx === null) {
    for (const voice of state.voices) voice.oscillator.stop()
    return
  }

  const stopNow = ctx.currentTime
  state.masterGain.gain.cancelScheduledValues(stopNow)
  state.masterGain.gain.setValueAtTime(state.masterGain.gain.value, stopNow)
  state.masterGain.gain.setTargetAtTime(0, stopNow, MEDITATIVE_RELEASE_TIME_CONSTANT_S)

  setTimeout(() => {
    for (const voice of state.voices) voice.oscillator.stop()
  }, MEDITATIVE_RELEASE_SETTLE_MS)
}
