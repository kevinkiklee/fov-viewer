import { defineRouting } from 'next-intl/routing'

export const locales = ['en', 'es', 'ja', 'de', 'fr', 'nl', 'ko', 'pt', 'it', 'hi'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  ja: '日本語',
  de: 'Deutsch',
  fr: 'Français',
  nl: 'Nederlands',
  ko: '한국어',
  pt: 'Português',
  it: 'Italiano',
  hi: 'हिन्दी',
}

export const localeOpenGraph: Record<Locale, string> = {
  en: 'en_US',
  es: 'es_ES',
  ja: 'ja_JP',
  de: 'de_DE',
  fr: 'fr_FR',
  nl: 'nl_NL',
  ko: 'ko_KR',
  pt: 'pt_BR',
  it: 'it_IT',
  hi: 'hi_IN',
}

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always',
})
