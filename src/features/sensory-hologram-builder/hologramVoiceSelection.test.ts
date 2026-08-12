import { describe, expect, it } from 'vitest'
import { NARRATION_LANGUAGE_TAGS, pickVoiceForLanguage, type VoiceLike } from './hologramVoiceSelection'

describe('NARRATION_LANGUAGE_TAGS', () => {
  it('targets Indian English (en-IN), not en-US, per this exercise\'s own spec', () => {
    expect(NARRATION_LANGUAGE_TAGS.en).toBe('en-IN')
    expect(NARRATION_LANGUAGE_TAGS.hi).toBe('hi-IN')
  })
})

describe('pickVoiceForLanguage', () => {
  it('returns null when no voice matches the requested language at all', () => {
    const voices: VoiceLike[] = [{ name: 'Google Deutsch', lang: 'de-DE' }]
    expect(pickVoiceForLanguage(voices, 'en')).toBeNull()
    expect(pickVoiceForLanguage(voices, 'hi')).toBeNull()
  })

  it('prefers a name-heuristic male voice when one exists for the language', () => {
    const voices: VoiceLike[] = [
      { name: 'Samantha (Female)', lang: 'en-IN' },
      { name: 'Daniel (Male)', lang: 'en-IN' },
    ]
    expect(pickVoiceForLanguage(voices, 'en')?.name).toBe('Daniel (Male)')
  })

  it('falls back to the first available match when no male-heuristic voice exists', () => {
    const voices: VoiceLike[] = [
      { name: 'Google हिन्दी', lang: 'hi-IN' },
      { name: 'Microsoft Swara', lang: 'hi-IN' },
    ]
    const picked = pickVoiceForLanguage(voices, 'hi')
    expect(picked).not.toBeNull()
    expect(voices.map((v) => v.name)).toContain(picked!.name)
  })

  it('picks a real male Hindi voice by name when one is present (e.g. Microsoft Hemant)', () => {
    const voices: VoiceLike[] = [
      { name: 'Microsoft Swara - Hindi (India)', lang: 'hi-IN' },
      { name: 'Microsoft Hemant - Hindi (India)', lang: 'hi-IN' },
    ]
    expect(pickVoiceForLanguage(voices, 'hi')?.name).toContain('Hemant')
  })

  it('picks a real male Indian-English voice by name when one is present (e.g. Microsoft Ravi)', () => {
    const voices: VoiceLike[] = [
      { name: 'Microsoft Heera - English (India)', lang: 'en-IN' },
      { name: 'Microsoft Ravi - English (India)', lang: 'en-IN' },
    ]
    expect(pickVoiceForLanguage(voices, 'en')?.name).toContain('Ravi')
  })

  it('prefers an exact BCP-47 tag match (en-IN) over a same-language-different-region match', () => {
    const voices: VoiceLike[] = [
      { name: 'English (US) Voice', lang: 'en-US' },
      { name: 'English (India) Voice', lang: 'en-IN' },
    ]
    expect(pickVoiceForLanguage(voices, 'en')?.lang).toBe('en-IN')
  })

  it('falls back to any same-language voice when no exact-region match exists', () => {
    const voices: VoiceLike[] = [{ name: 'English (Australia) Voice', lang: 'en-AU' }]
    expect(pickVoiceForLanguage(voices, 'en')?.lang).toBe('en-AU')
  })

  it('never throws on an empty voice list', () => {
    expect(pickVoiceForLanguage([], 'en')).toBeNull()
    expect(pickVoiceForLanguage([], 'hi')).toBeNull()
  })

  it('language matching is case-insensitive on both name and lang tag', () => {
    const voices: VoiceLike[] = [{ name: 'DANIEL MALE VOICE', lang: 'EN-IN' }]
    expect(pickVoiceForLanguage(voices, 'en')?.name).toBe('DANIEL MALE VOICE')
  })

  it('prefers an on-device (localService) voice over a network one when no gender hint is available', () => {
    const voices: VoiceLike[] = [
      { name: 'Cloud Voice One', lang: 'en-IN', localService: false },
      { name: 'Cloud Voice Two', lang: 'en-IN', localService: false },
      { name: 'Local Voice', lang: 'en-IN', localService: true },
    ]
    expect(pickVoiceForLanguage(voices, 'en')?.name).toBe('Local Voice')
  })

  it('prefers a local, name-heuristic male voice above every other tier — the "studio-grade" combination', () => {
    const voices: VoiceLike[] = [
      { name: 'Cloud Male Voice', lang: 'en-IN', localService: false },
      { name: 'Local Female Voice', lang: 'en-IN', localService: true },
      { name: 'Local Male Voice (Male)', lang: 'en-IN', localService: true },
    ]
    expect(pickVoiceForLanguage(voices, 'en')?.name).toBe('Local Male Voice (Male)')
  })

  it('still prefers a network male voice over a local voice with no gender hint at all', () => {
    const voices: VoiceLike[] = [
      { name: 'Local Voice', lang: 'en-IN', localService: true },
      { name: 'Daniel (Male)', lang: 'en-IN', localService: false },
    ]
    expect(pickVoiceForLanguage(voices, 'en')?.name).toBe('Daniel (Male)')
  })

  it('treats a voice with no localService field as equivalent to non-local, never throwing', () => {
    const voices: VoiceLike[] = [{ name: 'Unknown Voice', lang: 'en-IN' }]
    expect(pickVoiceForLanguage(voices, 'en')?.name).toBe('Unknown Voice')
  })
})
