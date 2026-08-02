// Multi-Language Support — the one shared list the language selector UI,
// the Route Handler's validation, and the Claude prompt all read from, so
// adding a language later never means updating three separate hardcoded
// lists that can drift out of sync.
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'mr', name: 'Marathi' },
  { code: 'ta', name: 'Tamil' },
] as const

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]['code']

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en'

const LANGUAGE_NAMES: Record<SupportedLanguage, string> = Object.fromEntries(
  SUPPORTED_LANGUAGES.map((language) => [language.code, language.name]),
) as Record<SupportedLanguage, string>

export function isSupportedLanguage(value: string): value is SupportedLanguage {
  return (SUPPORTED_LANGUAGES as readonly { code: string; name: string }[]).some((language) => language.code === value)
}

export function getLanguageName(code: SupportedLanguage): string {
  return LANGUAGE_NAMES[code]
}
