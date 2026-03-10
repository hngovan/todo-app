export const LANGUAGES = {
  en: { label: 'English', flag: '🇺🇸', nativeName: 'English' },
  vi: { label: 'Tiếng Việt', flag: '🇻🇳', nativeName: 'Tiếng Việt' },
  ja: { label: '日本語', flag: '🇯🇵', nativeName: '日本語' }
} as const

export type LanguageCode = keyof typeof LANGUAGES

export const DEFAULT_LANGUAGE: LanguageCode = 'en'
export const SUPPORTED_LANGUAGES = Object.keys(LANGUAGES) as LanguageCode[]
