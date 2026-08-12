import { describe, expect, it } from 'vitest'
import { pickVoiceForLanguage, type VoiceLike } from './hologramVoiceSelection'

describe('pickVoiceForLanguage', () => {
  it('returns null when no voice matches the requested language at all', () => {
    const voices: VoiceLike[] = [{ name: 'Google Deutsch', lang: 'de-DE' }]
    expect(pickVoiceForLanguage(voices, 'en')).toBeNull()
    expect(pickVoiceForLanguage(voices, 'hi')).toBeNull()
  })

  it('prefers a name-heuristic male voice when one exists for the language', () => {
    const voices: VoiceLike[] = [
      { name: 'Samantha (Female)', lang: 'en-US' },
      { name: 'Daniel (Male)', lang: 'en-US' },
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

  it('prefers an exact BCP-47 tag match over a same-language-different-region match', () => {
    const voices: VoiceLike[] = [
      { name: 'English (UK) Voice', lang: 'en-GB' },
      { name: 'English (US) Voice', lang: 'en-US' },
    ]
    expect(pickVoiceForLanguage(voices, 'en')?.lang).toBe('en-US')
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
    const voices: VoiceLike[] = [{ name: 'DANIEL MALE VOICE', lang: 'EN-US' }]
    expect(pickVoiceForLanguage(voices, 'en')?.name).toBe('DANIEL MALE VOICE')
  })
})
